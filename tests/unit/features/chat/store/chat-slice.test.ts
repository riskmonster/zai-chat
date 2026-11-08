import { beforeEach, describe, expect, it } from 'vitest'

import { createInitialChatDomainState, type Conversation } from '@/features/chat/model/chat-types'
import { useChatStore } from '@/features/chat/store/chat-slice'

const conversation: Conversation = {
  id: 'conversation-1',
  title: '测试会话',
  createdAt: '2026-11-07T10:00:00.000Z',
  updatedAt: '2026-11-07T10:00:00.000Z',
}

describe('chatSlice', () => {
  beforeEach(() => {
    useChatStore.setState({
      ...createInitialChatDomainState(),
      applyDomainAction: useChatStore.getState().applyDomainAction,
    })
  })

  it('applies domain actions without owning network side effects', () => {
    useChatStore.getState().applyDomainAction({
      type: 'conversation_upserted',
      conversation,
    })

    expect(useChatStore.getState().conversations).toEqual([conversation])
    expect(useChatStore.getState().conversationPhase).toBe('ready')
    expect('sendText' in useChatStore.getState()).toBe(false)
  })

  it('tracks the active conversation as a synchronous state transition', () => {
    useChatStore.getState().applyDomainAction({
      type: 'active_conversation_changed',
      conversationId: conversation.id,
    })

    expect(useChatStore.getState().activeConversationId).toBe(conversation.id)
  })
})
