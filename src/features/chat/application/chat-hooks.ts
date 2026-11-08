import { useMemo } from 'react'

import { selectMessageError, selectMessages, selectRun } from '../model/chat-selectors'
import type { ChatMessageView, ConversationView } from '../model/chat-view-model'
import { toChatMessageViews, toConversationViews } from '../model/chat-view-model'
import { useChatStore } from '../store/chat-slice'

export interface ConversationListModel {
  conversations: ConversationView[]
  conversationPhase: 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  conversationError: string | null
}

export function useConversationListModel(): ConversationListModel {
  const conversations = useChatStore((state) => state.conversations)
  const conversationPhase = useChatStore((state) => state.conversationPhase)
  const conversationError = useChatStore((state) => state.conversationError)
  const conversationViews = useMemo(() => toConversationViews(conversations), [conversations])

  return {
    conversations: conversationViews,
    conversationPhase,
    conversationError: conversationError?.message ?? null,
  }
}

export interface ChatDetailModel {
  conversationId: string | null
  messages: ChatMessageView[]
  runPhase:
    | 'idle'
    | 'submitting'
    | 'queued'
    | 'streaming'
    | 'stopping'
    | 'completed'
    | 'failed'
    | 'cancelled'
  runError: string | null
  messageError: string | null
  canRetry: boolean
}

export function useChatDetailModel(routeConversationId: string | null): ChatDetailModel {
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const conversationId = routeConversationId ?? activeConversationId
  const rawMessages = useChatStore((state) => selectMessages(state, conversationId))
  const run = useChatStore((state) => selectRun(state, conversationId))
  const messageError = useChatStore((state) => selectMessageError(state, conversationId))
  const messages = useMemo(() => toChatMessageViews(rawMessages), [rawMessages])
  const runPhase = run?.phase ?? 'idle'

  return {
    conversationId,
    messages,
    runPhase,
    runError: run?.error?.message ?? null,
    messageError: messageError?.message ?? null,
    canRetry: runPhase === 'failed' || runPhase === 'cancelled',
  }
}
