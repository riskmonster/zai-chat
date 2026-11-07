import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatApi } from '@/api/chat'

const serviceMock = vi.hoisted(() => ({
  conversationsUsingGet: vi.fn(),
  conversationsUsingPost: vi.fn(),
  conversationsConversationIdMessagesUsingGet: vi.fn(),
  conversationsConversationIdMessagesUsingPost: vi.fn(),
  runsRunIdUsingGet: vi.fn(),
  runsRunIdCancelUsingPost: vi.fn(),
  runsRunIdRetryUsingPost: vi.fn(),
}))

vi.mock('@/service', () => serviceMock)
vi.mock('@/services/sse', () => ({
  streamRunEvents: vi.fn(() => ({ abort: vi.fn() })),
}))

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a new chat message to the generated OpenAPI operation', async () => {
    serviceMock.conversationsConversationIdMessagesUsingPost.mockResolvedValue({
      userMessage: {},
      assistantMessageId: 'assistant-1',
      runId: 'run-1',
    })

    await chatApi.sendMessage({
      conversationId: 'conversation-1',
      clientMessageId: 'client-1',
      text: '你好',
    })

    expect(
      serviceMock.conversationsConversationIdMessagesUsingPost,
    ).toHaveBeenCalledWith({
      params: { conversationId: 'conversation-1' },
      body: {
        clientMessageId: 'client-1',
        content: { type: 'text', text: '你好' },
        stream: true,
      },
    })
  })

  it('creates a conversation without leaking API provider details', async () => {
    serviceMock.conversationsUsingPost.mockResolvedValue({})

    await chatApi.createConversation('新对话')

    expect(serviceMock.conversationsUsingPost).toHaveBeenCalledWith({
      body: { title: '新对话' },
    })
  })
})
