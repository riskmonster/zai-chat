import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatApi } from '@/features/chat/api/chat-api'

const serviceMock = vi.hoisted(() => ({
  conversationsUsingGet: vi.fn(),
  conversationsUsingPost: vi.fn(),
  conversationsConversationIdMessagesUsingGet: vi.fn(),
  conversationsConversationIdMessagesUsingPost: vi.fn(),
  runsRunIdUsingGet: vi.fn(),
  runsRunIdCancelUsingPost: vi.fn(),
  runsRunIdRetryUsingPost: vi.fn(),
}))

vi.mock('@/generated/openapi', () => serviceMock)
vi.mock('@/features/chat/api/chat-stream', () => ({
  streamRunEvents: vi.fn(() => ({ abort: vi.fn() })),
}))

const message = {
  id: 'user-1',
  conversationId: 'conversation-1',
  role: 'user' as const,
  content: { type: 'text' as const, text: '你好' },
  status: 'pending' as const,
  createdAt: '2026-11-07T10:00:00.000Z',
}

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a new chat message to the generated OpenAPI operation', async () => {
    serviceMock.conversationsConversationIdMessagesUsingPost.mockResolvedValue({
      userMessage: message,
      assistantMessageId: 'assistant-1',
      runId: 'run-1',
    })

    const accepted = await chatApi.sendMessage({
      conversationId: 'conversation-1',
      clientMessageId: 'client-1',
      text: '你好',
    })

    expect(serviceMock.conversationsConversationIdMessagesUsingPost).toHaveBeenCalledWith({
      params: { conversationId: 'conversation-1' },
      body: {
        clientMessageId: 'client-1',
        content: { type: 'text', text: '你好' },
        stream: true,
      },
    })
    expect(accepted).toEqual({
      userMessage: message,
      assistantMessageId: 'assistant-1',
      runId: 'run-1',
    })
  })

  it('maps a generated conversation into the domain model', async () => {
    serviceMock.conversationsUsingPost.mockResolvedValue({
      id: 'conversation-1',
      title: '新对话',
      createdAt: '2026-11-07T10:00:00.000Z',
      updatedAt: '2026-11-07T10:00:00.000Z',
    })

    const conversation = await chatApi.createConversation('新对话')

    expect(serviceMock.conversationsUsingPost).toHaveBeenCalledWith({
      body: { title: '新对话' },
    })
    expect(conversation).toEqual({
      id: 'conversation-1',
      title: '新对话',
      createdAt: '2026-11-07T10:00:00.000Z',
      updatedAt: '2026-11-07T10:00:00.000Z',
    })
  })
})
