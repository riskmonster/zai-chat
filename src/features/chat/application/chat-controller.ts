import { AppError, toAppError } from '@/shared/lib/errors'
import { createClientMessageId } from '@/shared/lib/id'

import { chatApi, type ChatApi } from '../api/chat-api'
import {
  createIdleRunState,
  type ChatRunPhase,
  type Conversation,
  type Message,
} from '../model/chat-types'
import type { ChatStoreApi } from '../store/chat-slice'
import { useChatStore } from '../store/chat-slice'
import { RunConnectionRegistry } from './run-connections'

const terminalPhases = new Set<ChatRunPhase>(['completed', 'failed', 'cancelled'])
const busyPhases = new Set<ChatRunPhase>(['submitting', 'queued', 'streaming', 'stopping'])

export interface ChatControllerDependencies {
  api?: ChatApi
  store?: ChatStoreApi
  createMessageId?: () => string
  now?: () => string
  connections?: RunConnectionRegistry
}

export interface ChatController {
  loadConversations: () => Promise<void>
  loadDefaultConversation: (userId: string) => Promise<void>
  createConversation: (title?: string) => Promise<Conversation | null>
  startNewConversation: () => void
  openConversation: (conversationId: string) => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  loadPersistedMessages: (userId: string) => Promise<void>
  sendText: (conversationId: string | null, text: string) => Promise<boolean>
  sendPersistedText: (userId: string, text: string) => Promise<boolean>
  stopGeneration: (conversationId: string) => Promise<void>
  retryGeneration: (conversationId: string) => Promise<void>
  clearConversationError: () => void
}

export function createChatController({
  api = chatApi,
  store = useChatStore,
  createMessageId = createClientMessageId,
  now = () => new Date().toISOString(),
  connections = new RunConnectionRegistry(),
}: ChatControllerDependencies = {}): ChatController {
  const reconcileRun = async (conversationId: string, runId: string) => {
    if (terminalPhases.has(store.getState().runsByConversation[conversationId]?.phase ?? 'idle')) {
      return
    }
    try {
      const run = await api.getRun(runId)
      store.getState().applyDomainAction({ type: 'run_snapshot', conversationId, run })
    } catch (error) {
      store.getState().applyDomainAction({
        type: 'run_stream_error',
        conversationId,
        error: toAppError(error, 'REQUEST_FAILED'),
      })
    }
  }

  const startRunStream = (conversationId: string, runId: string) => {
    try {
      const connection = api.streamRun({
        runId,
        onEvent: (event) => {
          store.getState().applyDomainAction({ type: 'run_event', conversationId, event })
          if (event.type === 'done' || event.type === 'error') {
            connections.abort(runId)
          }
        },
        onError: (error) => {
          connections.remove(runId)
          const phase = store.getState().runsByConversation[conversationId]?.phase
          if (phase && terminalPhases.has(phase)) {
            return
          }
          store.getState().applyDomainAction({
            type: 'run_stream_error',
            conversationId,
            error: toAppError(error, 'NETWORK_ERROR'),
          })
        },
        onComplete: () => {
          connections.remove(runId)
          void reconcileRun(conversationId, runId)
        },
      })
      connections.add(runId, connection)
    } catch (error) {
      store.getState().applyDomainAction({
        type: 'run_stream_error',
        conversationId,
        error: toAppError(error, 'NETWORK_ERROR'),
      })
    }
  }

  const controller: ChatController = {
    async loadConversations() {
      if (store.getState().conversationPhase === 'loading') {
        return
      }
      store.getState().applyDomainAction({ type: 'conversations_loading' })
      try {
        const page = await api.listConversations()
        store.getState().applyDomainAction({ type: 'conversations_loaded', page })
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'conversations_failed',
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async loadDefaultConversation(userId) {
      store.getState().applyDomainAction({ type: 'conversations_loading' })
      try {
        const page = await api.listPersistedMessages()
        const latest = page.items[page.items.length - 1]
        const updatedAt = latest?.createdAt ?? now()
        const conversation: Conversation = {
          id: userId,
          title: '默认会话',
          ...(latest !== undefined
            ? {
                lastMessagePreview: latest.content.text.slice(0, 160),
                lastMessageAt: latest.createdAt,
              }
            : {}),
          createdAt: updatedAt,
          updatedAt,
        }
        store.getState().applyDomainAction({
          type: 'conversations_loaded',
          page: { items: [conversation] },
        })
        store.getState().applyDomainAction({
          type: 'active_conversation_changed',
          conversationId: userId,
        })
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'conversations_failed',
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async createConversation(title) {
      try {
        const conversation = await api.createConversation(title)
        store.getState().applyDomainAction({ type: 'conversation_upserted', conversation })
        store.getState().applyDomainAction({
          type: 'active_conversation_changed',
          conversationId: conversation.id,
        })
        return conversation
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'conversations_failed',
          error: toAppError(error, 'REQUEST_FAILED'),
        })
        return null
      }
    },

    startNewConversation() {
      store.getState().applyDomainAction({
        type: 'active_conversation_changed',
        conversationId: null,
      })
    },

    async openConversation(conversationId) {
      store.getState().applyDomainAction({
        type: 'active_conversation_changed',
        conversationId,
      })
      const phase = store.getState().messagePhaseByConversation[conversationId] ?? 'idle'
      if (phase === 'idle' || phase === 'error') {
        await controller.loadMessages(conversationId)
      }
    },

    async loadMessages(conversationId) {
      if (store.getState().messagePhaseByConversation[conversationId] === 'loading') {
        return
      }
      store.getState().applyDomainAction({ type: 'messages_loading', conversationId })
      try {
        const page = await api.listMessages({ conversationId })
        store.getState().applyDomainAction({ type: 'messages_loaded', conversationId, page })
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'messages_failed',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async loadPersistedMessages(userId) {
      if (store.getState().messagePhaseByConversation[userId] === 'loading') {
        return
      }
      store.getState().applyDomainAction({ type: 'messages_loading', conversationId: userId })
      try {
        const page = await api.listPersistedMessages()
        store.getState().applyDomainAction({
          type: 'messages_loaded',
          conversationId: userId,
          page,
        })
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'messages_failed',
          conversationId: userId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async sendText(conversationId, text) {
      const content = text.trim()
      if (content.length === 0) {
        return false
      }

      let targetConversationId = conversationId
      if (targetConversationId !== null) {
        const currentRun = store.getState().runsByConversation[targetConversationId]
        if (currentRun && busyPhases.has(currentRun.phase)) {
          return false
        }
      }

      if (targetConversationId === null) {
        const conversation = await controller.createConversation(createConversationTitle(content))
        if (!conversation) {
          return false
        }
        targetConversationId = conversation.id
      }

      const clientMessageId = createMessageId()
      const createdAt = now()
      const optimisticMessage: Message = {
        id: clientMessageId,
        conversationId: targetConversationId,
        role: 'user',
        content: {
          type: 'text',
          text: content,
        },
        status: 'pending',
        createdAt,
      }

      store.getState().applyDomainAction({
        type: 'send_started',
        conversationId: targetConversationId,
        userMessage: optimisticMessage,
      })

      try {
        const accepted = await api.sendMessage({
          conversationId: targetConversationId,
          clientMessageId,
          text: content,
        })
        store.getState().applyDomainAction({
          type: 'send_accepted',
          conversationId: targetConversationId,
          userMessage: accepted.userMessage,
          assistantMessageId: accepted.assistantMessageId,
          runId: accepted.runId,
        })
        startRunStream(targetConversationId, accepted.runId)
        return true
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'send_failed',
          conversationId: targetConversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
        return false
      }
    },

    async sendPersistedText(userId, text) {
      const content = text.trim()
      if (content.length === 0) {
        return false
      }
      if (content.length > 2000) {
        store.getState().applyDomainAction({
          type: 'send_failed',
          conversationId: userId,
          error: new AppError({
            code: 'MESSAGE_TEXT_TOO_LONG',
            message: '单条消息不能超过 2000 字',
          }),
        })
        return false
      }

      const clientMessageId = createMessageId()
      const createdAt = now()
      const optimisticMessage: Message = {
        id: clientMessageId,
        conversationId: userId,
        role: 'user',
        content: {
          type: 'text',
          text: content,
        },
        status: 'pending',
        createdAt,
      }
      store.getState().applyDomainAction({
        type: 'send_started',
        conversationId: userId,
        userMessage: optimisticMessage,
      })

      try {
        const message = await api.sendPersistedMessage({
          clientMessageId,
          text: content,
        })
        store.getState().applyDomainAction({
          type: 'persisted_message_sent',
          conversationId: userId,
          clientMessageId,
          message,
        })
        return true
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'send_failed',
          conversationId: userId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
        return false
      }
    },

    async stopGeneration(conversationId) {
      const run = store.getState().runsByConversation[conversationId] ?? createIdleRunState()
      if (run.runId === undefined) {
        return
      }

      store.getState().applyDomainAction({ type: 'run_stopping', conversationId })
      connections.abort(run.runId)

      try {
        const cancelledRun = await api.cancelRun(run.runId)
        store.getState().applyDomainAction({
          type: 'run_snapshot',
          conversationId,
          run: cancelledRun,
        })
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'run_stream_error',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async retryGeneration(conversationId) {
      const currentRun = store.getState().runsByConversation[conversationId]
      const runId = currentRun?.runId ?? ''
      if (runId.length === 0 || busyPhases.has(currentRun?.phase ?? 'idle')) {
        return
      }

      store.getState().applyDomainAction({ type: 'run_retrying', conversationId })
      try {
        const run = await api.retryRun(runId)
        store.getState().applyDomainAction({ type: 'run_snapshot', conversationId, run })
        startRunStream(conversationId, run.id)
      } catch (error) {
        store.getState().applyDomainAction({
          type: 'run_stream_error',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    clearConversationError() {
      store.getState().applyDomainAction({ type: 'conversation_error_cleared' })
    },
  }

  return controller
}

export const chatController = createChatController()

function createConversationTitle(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim()
  return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized
}
