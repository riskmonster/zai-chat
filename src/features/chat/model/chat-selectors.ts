import type { AppError } from '@/shared/lib/errors'

import type { ChatDomainState, ConversationRunState, Message } from './chat-types'

const EMPTY_MESSAGES: Message[] = []

export function selectMessages(state: ChatDomainState, conversationId: string | null): Message[] {
  return conversationId !== null
    ? (state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES)
    : EMPTY_MESSAGES
}

export function selectRun(
  state: ChatDomainState,
  conversationId: string | null,
): ConversationRunState | undefined {
  return conversationId !== null ? state.runsByConversation[conversationId] : undefined
}

export function selectMessageError(
  state: ChatDomainState,
  conversationId: string | null,
): AppError | null {
  return conversationId !== null ? (state.messageErrorByConversation[conversationId] ?? null) : null
}
