import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatApi } from '@/features/chat/api/chat-api'

const serviceMock = vi.hoisted(() => ({
  conversationsUsingGet: vi.fn(),
  conversationsUsingPost: vi.fn(),
  conversationsConversationIdMessagesUsingGet: vi.fn(),
  conversationsConversationIdMessagesUsingPost: vi.fn(),
  messagesUsingGet: vi.fn(),
  messagesUsingPost: vi.fn(),
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

  it('uses persisted message operations without starting a run', async () => {
    serviceMock.messagesUsingPost.mockResolvedValue({
      message: {
        id: 'persisted-1',
        clientMessageId: 'client-1',
        conversationId: 'user-1',
        role: 'user',
        content: { type: 'text', text: '你好' },
        status: 'completed',
        createdAt: '2026-11-07T10:00:00.000Z',
        completedAt: '2026-11-07T10:00:00.000Z',
      },
    })

    const saved = await chatApi.sendPersistedMessage({
      clientMessageId: 'client-1',
      text: '你好',
    })

    expect(serviceMock.messagesUsingPost).toHaveBeenCalledWith({
      body: {
        clientMessageId: 'client-1',
        content: { type: 'text', text: '你好' },
      },
    })
    expect(saved.status).toBe('completed')
    expect(saved.conversationId).toBe('user-1')
  })

  it('maps desc-paginated persisted messages into chronological render order', async () => {
    serviceMock.messagesUsingGet.mockResolvedValue({
      items: [
        {
          id: 'message-2',
          clientMessageId: 'client-2',
          conversationId: 'user-1',
          role: 'user',
          content: { type: 'text', text: '第二条' },
          status: 'completed',
          createdAt: '2026-11-07T10:01:00.000Z',
          completedAt: '2026-11-07T10:01:00.000Z',
        },
        {
          id: 'message-1',
          clientMessageId: 'client-1',
          conversationId: 'user-1',
          role: 'user',
          content: { type: 'text', text: '第一条' },
          status: 'completed',
          createdAt: '2026-11-07T10:00:00.000Z',
          completedAt: '2026-11-07T10:00:00.000Z',
        },
      ],
    })

    const page = await chatApi.listPersistedMessages()

    expect(page.items.map((message) => message.id)).toEqual(['message-1', 'message-2'])
  })
})
