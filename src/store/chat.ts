import { create } from 'zustand'

import { chatApi } from '@/api/chat'
import { createClientMessageId } from '@/domain/chat/id'
import {
  chatDomainReducer,
  type ChatDomainAction,
} from '@/domain/chat/reducer'
import {
  createIdleRunState,
  createInitialChatDomainState,
  type ChatDomainState,
  type ChatRunPhase,
} from '@/domain/chat/types'
import { toAppError } from '@/domain/errors'
import type { StreamConnection } from '@/services/sse'
import type { Conversation, Message } from '@/service/types'

interface ChatStore extends ChatDomainState {
  loadConversations: () => Promise<void>
  createConversation: (title?: string) => Promise<Conversation | null>
  openConversation: (conversationId: string) => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  sendText: (
    conversationId: string | null,
    text: string,
  ) => Promise<boolean>
  stopGeneration: (conversationId: string) => Promise<void>
  retryGeneration: (conversationId: string) => Promise<void>
  clearConversationError: () => void
}

const activeConnections = new Map<string, StreamConnection>()
const terminalPhases = new Set<ChatRunPhase>([
  'completed',
  'failed',
  'cancelled',
])
const busyPhases = new Set<ChatRunPhase>([
  'submitting',
  'queued',
  'streaming',
  'stopping',
])

export const useChatStore = create<ChatStore>()((set, get) => {
  const dispatch = (action: ChatDomainAction) => {
    set(state => chatDomainReducer(state, action))
  }

  const reconcileRun = async (conversationId: string, runId: string) => {
    if (terminalPhases.has(get().runsByConversation[conversationId]?.phase ?? 'idle')) {
      return
    }
    try {
      const run = await chatApi.getRun(runId)
      dispatch({ type: 'run_snapshot', conversationId, run })
    }
    catch (error) {
      dispatch({
        type: 'run_stream_error',
        conversationId,
        error: toAppError(error, 'REQUEST_FAILED'),
      })
    }
  }

  const startRunStream = (conversationId: string, runId: string) => {
    let connection: StreamConnection | undefined
    try {
      connection = chatApi.streamRun({
        runId,
        onEvent: (event) => {
          dispatch({ type: 'run_event', conversationId, event })
          if (event.type === 'done' || event.type === 'error') {
            activeConnections.delete(runId)
            connection?.abort()
          }
        },
        onError: (error) => {
          activeConnections.delete(runId)
          const phase = get().runsByConversation[conversationId]?.phase
          if (phase && terminalPhases.has(phase)) {
            return
          }
          dispatch({
            type: 'run_stream_error',
            conversationId,
            error: toAppError(error, 'NETWORK_ERROR'),
          })
        },
        onComplete: () => {
          activeConnections.delete(runId)
          void reconcileRun(conversationId, runId)
        },
      })
      activeConnections.set(runId, connection)
    }
    catch (error) {
      dispatch({
        type: 'run_stream_error',
        conversationId,
        error: toAppError(error, 'NETWORK_ERROR'),
      })
    }
  }

  return {
    ...createInitialChatDomainState(),

    async loadConversations() {
      if (get().conversationPhase === 'loading') {
        return
      }
      dispatch({ type: 'conversations_loading' })
      try {
        const page = await chatApi.listConversations()
        dispatch({ type: 'conversations_loaded', page })
      }
      catch (error) {
        dispatch({
          type: 'conversations_failed',
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async createConversation(title) {
      try {
        const conversation = await chatApi.createConversation(title)
        dispatch({ type: 'conversation_upserted', conversation })
        dispatch({
          type: 'active_conversation_changed',
          conversationId: conversation.id,
        })
        return conversation
      }
      catch (error) {
        dispatch({
          type: 'conversations_failed',
          error: toAppError(error, 'REQUEST_FAILED'),
        })
        return null
      }
    },

    async openConversation(conversationId) {
      dispatch({
        type: 'active_conversation_changed',
        conversationId,
      })
      const phase = get().messagePhaseByConversation[conversationId] ?? 'idle'
      if (phase === 'idle' || phase === 'error') {
        await get().loadMessages(conversationId)
      }
    },

    async loadMessages(conversationId) {
      if (get().messagePhaseByConversation[conversationId] === 'loading') {
        return
      }
      dispatch({ type: 'messages_loading', conversationId })
      try {
        const page = await chatApi.listMessages({ conversationId })
        dispatch({ type: 'messages_loaded', conversationId, page })
      }
      catch (error) {
        dispatch({
          type: 'messages_failed',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async sendText(conversationId, text) {
      const content = text.trim()
      if (!content) {
        return false
      }

      let targetConversationId = conversationId
      if (targetConversationId) {
        const currentRun = get().runsByConversation[targetConversationId]
        if (currentRun && busyPhases.has(currentRun.phase)) {
          return false
        }
      }

      if (!targetConversationId) {
        const conversation = await get().createConversation(
          createConversationTitle(content),
        )
        if (!conversation) {
          return false
        }
        targetConversationId = conversation.id
      }

      const clientMessageId = createClientMessageId()
      const createdAt = new Date().toISOString()
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

      dispatch({
        type: 'send_started',
        conversationId: targetConversationId,
        userMessage: optimisticMessage,
      })

      try {
        const accepted = await chatApi.sendMessage({
          conversationId: targetConversationId,
          clientMessageId,
          text: content,
        })
        dispatch({
          type: 'send_accepted',
          conversationId: targetConversationId,
          userMessage: accepted.userMessage,
          assistantMessageId: accepted.assistantMessageId,
          runId: accepted.runId,
        })
        startRunStream(targetConversationId, accepted.runId)
        return true
      }
      catch (error) {
        dispatch({
          type: 'send_failed',
          conversationId: targetConversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
        return false
      }
    },

    async stopGeneration(conversationId) {
      const run = get().runsByConversation[conversationId]
        ?? createIdleRunState()
      if (!run.runId) {
        return
      }

      dispatch({ type: 'run_stopping', conversationId })
      const connection = activeConnections.get(run.runId)
      connection?.abort()
      activeConnections.delete(run.runId)

      try {
        const cancelledRun = await chatApi.cancelRun(run.runId)
        dispatch({
          type: 'run_snapshot',
          conversationId,
          run: cancelledRun,
        })
      }
      catch (error) {
        dispatch({
          type: 'run_stream_error',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    async retryGeneration(conversationId) {
      const currentRun = get().runsByConversation[conversationId]
      if (!currentRun?.runId || busyPhases.has(currentRun.phase)) {
        return
      }

      dispatch({ type: 'run_retrying', conversationId })
      try {
        const run = await chatApi.retryRun(currentRun.runId)
        dispatch({ type: 'run_snapshot', conversationId, run })
        startRunStream(conversationId, run.id)
      }
      catch (error) {
        dispatch({
          type: 'run_stream_error',
          conversationId,
          error: toAppError(error, 'REQUEST_FAILED'),
        })
      }
    },

    clearConversationError() {
      set(state => ({
        conversationError: null,
        conversationPhase: state.conversations.length ? 'ready' : 'empty',
      }))
    },
  }
})

function createConversationTitle(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim()
  return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized
}
