import { AppError } from '@/domain/errors'
import type { ChatRunEvent } from '@/services/sse/types'
import type {
  Conversation,
  ConversationPage,
  Message,
  MessagePage,
  Run,
} from '@/service/types'

import {
  createIdleRunState,
  mapRunStatusToPhase,
  type ChatDomainState,
  type ChatRunPhase,
  type ConversationRunState,
} from './types'

type MessageStatus = Message['status']

export type ChatDomainAction =
  | { type: 'conversations_loading' }
  | { type: 'conversations_loaded'; page: ConversationPage }
  | { type: 'conversations_failed'; error: AppError }
  | { type: 'conversation_upserted'; conversation: Conversation }
  | { type: 'active_conversation_changed'; conversationId: string | null }
  | { type: 'messages_loading'; conversationId: string }
  | { type: 'messages_loaded'; conversationId: string; page: MessagePage }
  | { type: 'messages_failed'; conversationId: string; error: AppError }
  | {
    type: 'send_started'
    conversationId: string
    userMessage: Message
  }
  | {
    type: 'send_accepted'
    conversationId: string
    userMessage: Message
    assistantMessageId: string
    runId: string
  }
  | { type: 'send_failed'; conversationId: string; error: AppError }
  | { type: 'run_stopping'; conversationId: string }
  | { type: 'run_retrying'; conversationId: string }
  | { type: 'run_stream_error'; conversationId: string; error: AppError }
  | { type: 'run_snapshot'; conversationId: string; run: Run }
  | {
    type: 'run_event'
    conversationId: string
    event: ChatRunEvent
  }

export function chatDomainReducer(
  state: ChatDomainState,
  action: ChatDomainAction,
): ChatDomainState {
  switch (action.type) {
    case 'conversations_loading':
      return {
        ...state,
        conversationPhase: 'loading',
        conversationError: null,
      }
    case 'conversations_loaded': {
      const conversations = dedupeConversations([
        ...action.page.items,
        ...state.conversations,
      ])
      return {
        ...state,
        conversations,
        conversationCursor: action.page.nextCursor,
        conversationPhase: conversations.length ? 'ready' : 'empty',
        conversationError: null,
      }
    }
    case 'conversations_failed':
      return {
        ...state,
        conversationPhase: state.conversations.length ? 'ready' : 'error',
        conversationError: action.error,
      }
    case 'conversation_upserted':
      return {
        ...state,
        conversations: dedupeConversations([
          action.conversation,
          ...state.conversations,
        ]),
        conversationPhase: 'ready',
        conversationError: null,
      }
    case 'active_conversation_changed':
      return {
        ...state,
        activeConversationId: action.conversationId,
      }
    case 'messages_loading':
      return {
        ...state,
        messagePhaseByConversation: {
          ...state.messagePhaseByConversation,
          [action.conversationId]: 'loading',
        },
        messageErrorByConversation: {
          ...state.messageErrorByConversation,
          [action.conversationId]: null,
        },
      }
    case 'messages_loaded': {
      const previous = state.messagesByConversation[action.conversationId] ?? []
      const messages = mergeMessages(previous, action.page.items)
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.conversationId]: messages,
        },
        messageCursorByConversation: {
          ...state.messageCursorByConversation,
          [action.conversationId]: action.page.nextCursor,
        },
        messagePhaseByConversation: {
          ...state.messagePhaseByConversation,
          [action.conversationId]: messages.length ? 'ready' : 'empty',
        },
        messageErrorByConversation: {
          ...state.messageErrorByConversation,
          [action.conversationId]: null,
        },
      }
    }
    case 'messages_failed':
      return {
        ...state,
        messagePhaseByConversation: {
          ...state.messagePhaseByConversation,
          [action.conversationId]: 'error',
        },
        messageErrorByConversation: {
          ...state.messageErrorByConversation,
          [action.conversationId]: action.error,
        },
      }
    case 'send_started':
      return updateConversationMessages(state, action.conversationId, messages => mergeMessages(
        messages,
        [action.userMessage],
      ), {
        runsByConversation: {
          ...state.runsByConversation,
          [action.conversationId]: {
            phase: 'submitting',
            userMessageId: action.userMessage.id,
            lastSequence: -1,
            error: null,
          },
        },
      })
    case 'send_accepted': {
      const previousRun = state.runsByConversation[action.conversationId]
      return updateConversationMessages(state, action.conversationId, messages => mergeMessages([
        ...messages.filter(message =>
          message.id !== previousRun?.userMessageId
          && message.id !== previousRun?.assistantMessageId,
        ),
        action.userMessage,
        createAssistantPlaceholder(
          action.assistantMessageId,
          action.conversationId,
          action.userMessage.createdAt,
        ),
      ], []), {
        runsByConversation: {
          ...state.runsByConversation,
          [action.conversationId]: {
            phase: 'queued',
            runId: action.runId,
            userMessageId: action.userMessage.id,
            assistantMessageId: action.assistantMessageId,
            lastSequence: -1,
            error: null,
          },
        },
      })
    }
    case 'send_failed': {
      const failedRun = state.runsByConversation[action.conversationId]
      return updateConversationMessages(
        state,
        action.conversationId,
        messages => messages.filter(message =>
          message.id !== failedRun?.userMessageId
          && message.id !== failedRun?.assistantMessageId,
        ),
        {
          runsByConversation: {
            ...state.runsByConversation,
            [action.conversationId]: {
              ...(state.runsByConversation[action.conversationId] ?? createIdleRunState()),
              phase: 'failed',
              error: action.error,
            },
          },
        },
      )
    }
    case 'run_stopping':
      return updateRun(state, action.conversationId, run => ({
        ...run,
        phase: 'stopping',
        error: null,
      }))
    case 'run_retrying':
      return updateRun(state, action.conversationId, run => ({
        ...run,
        phase: 'submitting',
        error: null,
      }), messages => updateAssistantMessage(
        messages,
        state,
        action.conversationId,
        { status: 'pending', errorCode: undefined },
      ))
    case 'run_stream_error':
      return updateRun(
        state,
        action.conversationId,
        run => ({
          ...run,
          phase: 'failed',
          error: action.error,
        }),
        messages => updateAssistantMessage(messages, state, action.conversationId, {
          status: 'failed',
          errorCode: action.error.code,
        }),
      )
    case 'run_snapshot': {
      const assistantMessageId = action.run.assistantMessageId
      const phase = mapRunStatusToPhase(action.run)
      const error = action.run.errorCode
        ? new AppError({
          code: action.run.errorCode,
          message: '生成失败，请稍后重试',
        })
        : null

      return updateRun(
        state,
        action.conversationId,
        run => ({
          ...run,
          phase,
          runId: action.run.id,
          userMessageId: action.run.userMessageId,
          assistantMessageId,
          error,
        }),
        messages => upsertAssistantMessage(
          messages,
          action.conversationId,
          assistantMessageId,
          action.run.createdAt,
          {
            status: mapMessageStatus(phase),
            errorCode: action.run.errorCode,
            completedAt: action.run.completedAt,
          },
        ),
      )
    }
    case 'run_event':
      return applyRunEvent(state, action.conversationId, action.event)
  }
}

function applyRunEvent(
  state: ChatDomainState,
  conversationId: string,
  event: ChatRunEvent,
): ChatDomainState {
  const currentRun = state.runsByConversation[conversationId] ?? createIdleRunState()
  if (event.sequence <= currentRun.lastSequence) {
    return state
  }

  const nextRun: ConversationRunState = {
    ...currentRun,
    lastSequence: event.sequence,
  }

  switch (event.type) {
    case 'meta':
      nextRun.assistantMessageId = event.messageId ?? event.data.messageId
      nextRun.error = null
      return updateRun(state, conversationId, () => nextRun)
    case 'delta': {
      const assistantMessageId = event.messageId ?? nextRun.assistantMessageId
      if (!assistantMessageId) {
        return state
      }
      nextRun.phase = 'streaming'
      nextRun.assistantMessageId = assistantMessageId
      nextRun.error = null
      return updateRun(
        state,
        conversationId,
        () => nextRun,
        messages => appendAssistantDelta(
          messages,
          conversationId,
          assistantMessageId,
          event.data.text,
        ),
      )
    }
    case 'done':
      nextRun.phase = event.data.status
      nextRun.error = event.data.status === 'failed' ? nextRun.error : null
      return updateRun(
        state,
        conversationId,
        () => nextRun,
        messages => updateAssistantMessage(messages, state, conversationId, {
          status: event.data.status,
          completedAt: event.data.completedAt,
        }),
      )
    case 'error': {
      nextRun.phase = 'failed'
      nextRun.error = new AppError({
        code: event.data.code,
        message: event.data.message,
        retryable: event.data.retryable,
      })
      return updateRun(
        state,
        conversationId,
        () => nextRun,
        messages => updateAssistantMessage(messages, state, conversationId, {
          status: 'failed',
          errorCode: event.data.code,
        }),
      )
    }
    case 'usage':
    case 'heartbeat':
      return updateRun(state, conversationId, () => nextRun)
  }
}

function dedupeConversations(conversations: Conversation[]): Conversation[] {
  const byId = new Map<string, Conversation>()
  for (const conversation of conversations) {
    byId.set(conversation.id, conversation)
  }
  return [...byId.values()].sort((left, right) => {
    const leftTime = left.lastMessageAt ?? left.updatedAt
    const rightTime = right.lastMessageAt ?? right.updatedAt
    return rightTime.localeCompare(leftTime)
  })
}

function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  let next = current
  for (const message of incoming) {
    next = replaceMessage(next, message)
  }
  return next
}

function replaceMessage(messages: Message[], next: Message): Message[] {
  const index = messages.findIndex(message => message.id === next.id)
  if (index < 0) {
    return [...messages, next]
  }
  return messages.map((message, currentIndex) =>
    currentIndex === index ? next : message,
  )
}

function updateConversationMessages(
  state: ChatDomainState,
  conversationId: string,
  update: (messages: Message[]) => Message[],
  extra: Partial<ChatDomainState> = {},
): ChatDomainState {
  const messages = update(state.messagesByConversation[conversationId] ?? [])
  return {
    ...state,
    ...extra,
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: messages,
    },
    messagePhaseByConversation: {
      ...state.messagePhaseByConversation,
      [conversationId]: messages.length ? 'ready' : 'empty',
    },
  }
}

function updateRun(
  state: ChatDomainState,
  conversationId: string,
  update: (run: ConversationRunState) => ConversationRunState,
  updateMessages?: (messages: Message[]) => Message[],
): ChatDomainState {
  const run = update(state.runsByConversation[conversationId] ?? createIdleRunState())
  if (!updateMessages) {
    return {
      ...state,
      runsByConversation: {
        ...state.runsByConversation,
        [conversationId]: run,
      },
    }
  }
  return updateConversationMessages(state, conversationId, updateMessages, {
    runsByConversation: {
      ...state.runsByConversation,
      [conversationId]: run,
    },
  })
}

function createAssistantPlaceholder(
  assistantMessageId: string,
  conversationId: string,
  createdAt: string,
): Message {
  return {
    id: assistantMessageId,
    conversationId,
    role: 'assistant',
    content: { type: 'text', text: '' },
    status: 'pending',
    createdAt,
  }
}

function appendAssistantDelta(
  messages: Message[],
  conversationId: string,
  assistantMessageId: string,
  delta: string,
): Message[] {
  const message = messages.find(item => item.id === assistantMessageId)
  const nextMessage: Message = message
    ? {
      ...message,
      status: 'streaming',
      content: {
        type: 'text',
        text: `${message.content.text}${delta}`,
      },
    }
    : {
      id: assistantMessageId,
      conversationId,
      role: 'assistant',
      content: { type: 'text', text: delta },
      status: 'streaming',
      createdAt: new Date().toISOString(),
    }

  return replaceMessage(messages, nextMessage)
}

function updateAssistantMessage(
  messages: Message[],
  state: ChatDomainState,
  conversationId: string,
  patch: Partial<Pick<Message, 'status' | 'errorCode' | 'completedAt'>>,
): Message[] {
  const assistantMessageId = state.runsByConversation[conversationId]?.assistantMessageId
  if (!assistantMessageId) {
    return messages
  }
  return messages.map(message =>
    message.id === assistantMessageId ? { ...message, ...patch } : message,
  )
}

function upsertAssistantMessage(
  messages: Message[],
  conversationId: string,
  assistantMessageId: string,
  createdAt: string,
  patch: Partial<Pick<Message, 'status' | 'errorCode' | 'completedAt'>>,
): Message[] {
  const message = messages.find(item => item.id === assistantMessageId)
    ?? createAssistantPlaceholder(assistantMessageId, conversationId, createdAt)
  return replaceMessage(messages, { ...message, ...patch })
}

function mapMessageStatus(phase: ChatRunPhase): MessageStatus {
  switch (phase) {
    case 'submitting':
    case 'queued':
      return 'pending'
    case 'streaming':
    case 'stopping':
      return 'streaming'
    case 'cancelled':
      return 'cancelled'
    case 'failed':
      return 'failed'
    case 'completed':
      return 'completed'
    case 'idle':
      return 'pending'
  }
}
