import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChatApi, StreamRunEventsOptions } from '@/features/chat/api/chat-api'
import { createChatController } from '@/features/chat/application/chat-controller'
import {
  createInitialChatDomainState,
  type Conversation,
  type Message,
  type Run,
} from '@/features/chat/model/chat-types'
import { useChatStore } from '@/features/chat/store/chat-slice'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    listConversations: vi.fn(),
    createConversation: vi.fn(),
    listMessages: vi.fn(),
    sendMessage: vi.fn(),
    listPersistedMessages: vi.fn(),
    sendPersistedMessage: vi.fn(),
    getRun: vi.fn(),
    cancelRun: vi.fn(),
    retryRun: vi.fn(),
    streamRun: vi.fn(),
  },
}))

vi.mock('@/features/chat/api/chat-api', () => ({
  chatApi: apiMock,
}))

const conversation: Conversation = {
  id: 'conversation-1',
  title: '你好',
  createdAt: '2026-11-07T10:00:00.000Z',
  updatedAt: '2026-11-07T10:00:00.000Z',
}

const userMessage: Message = {
  id: 'user-1',
  conversationId: conversation.id,
  role: 'user',
  content: { type: 'text', text: '你好' },
  status: 'pending',
  createdAt: '2026-11-07T10:00:00.000Z',
}

const assistantMessageId = 'assistant-1'
const runId = 'run-1'

describe('chatController', () => {
  beforeEach(() => {
    useChatStore.setState({
      ...createInitialChatDomainState(),
      applyDomainAction: useChatStore.getState().applyDomainAction,
    })
    vi.clearAllMocks()
  })

  it('creates a conversation, sends a message, and applies streamed events', async () => {
    let streamOptions: StreamRunEventsOptions | undefined
    const connection = { abort: vi.fn() }
    apiMock.createConversation.mockResolvedValue(conversation)
    apiMock.sendMessage.mockResolvedValue({
      userMessage,
      assistantMessageId,
      runId,
    })
    apiMock.streamRun.mockImplementation((options: StreamRunEventsOptions) => {
      streamOptions = options
      return connection
    })

    const controller = createChatController({
      api: apiMock as unknown as ChatApi,
      createMessageId: () => userMessage.id,
      now: () => userMessage.createdAt,
    })
    const didAccept = await controller.sendText(null, '  你好  ')

    expect(didAccept).toBe(true)
    expect(useChatStore.getState().activeConversationId).toBe(conversation.id)
    expect(useChatStore.getState().runsByConversation[conversation.id]?.phase).toBe('queued')

    streamOptions?.onEvent({
      sequence: 1,
      type: 'delta',
      runId,
      messageId: assistantMessageId,
      data: { text: '你好，' },
    })
    streamOptions?.onEvent({
      sequence: 2,
      type: 'delta',
      runId,
      messageId: assistantMessageId,
      data: { text: '很高兴见到你。' },
    })
    streamOptions?.onEvent({
      sequence: 3,
      type: 'done',
      runId,
      messageId: assistantMessageId,
      data: {
        status: 'completed',
        completedAt: '2026-11-07T10:00:02.000Z',
      },
    })

    expect(useChatStore.getState().messagesByConversation[conversation.id]?.[1]?.content.text).toBe(
      '你好，很高兴见到你。',
    )
    expect(useChatStore.getState().runsByConversation[conversation.id]?.phase).toBe('completed')
    expect(connection.abort).toHaveBeenCalled()
  })

  it('keeps the composer eligible for retry when sending fails', async () => {
    apiMock.createConversation.mockResolvedValue(conversation)
    apiMock.sendMessage.mockRejectedValue(new Error('网络错误'))

    const controller = createChatController({
      api: apiMock as unknown as ChatApi,
      createMessageId: () => userMessage.id,
      now: () => userMessage.createdAt,
    })
    const didAccept = await controller.sendText(conversation.id, '你好')

    expect(didAccept).toBe(false)
    expect(useChatStore.getState().messagesByConversation[conversation.id]).toEqual([])
    expect(useChatStore.getState().runsByConversation[conversation.id]?.phase).toBe('failed')
  })

  it('cancels the active run and reconciles the authoritative state', async () => {
    const cancelledRun: Run = {
      id: runId,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      assistantMessageId,
      status: 'cancelled',
      modelAlias: 'default',
      createdAt: '2026-11-07T10:00:00.000Z',
      completedAt: '2026-11-07T10:00:03.000Z',
    }
    useChatStore.setState({
      runsByConversation: {
        [conversation.id]: {
          phase: 'streaming',
          runId,
          userMessageId: userMessage.id,
          assistantMessageId,
          lastSequence: 2,
          error: null,
        },
      },
    })
    apiMock.cancelRun.mockResolvedValue(cancelledRun)

    const controller = createChatController({ api: apiMock as unknown as ChatApi })
    await controller.stopGeneration(conversation.id)

    expect(apiMock.cancelRun).toHaveBeenCalledWith(runId)
    expect(useChatStore.getState().runsByConversation[conversation.id]?.phase).toBe('cancelled')
  })

  it('persists a stage-one message without creating an assistant placeholder', async () => {
    const persistedMessage: Message = {
      ...userMessage,
      id: 'message-server-1',
      status: 'completed',
      completedAt: userMessage.createdAt,
    }
    apiMock.sendPersistedMessage.mockResolvedValue(persistedMessage)

    const controller = createChatController({
      api: apiMock as unknown as ChatApi,
      createMessageId: () => userMessage.id,
      now: () => userMessage.createdAt,
    })
    const didAccept = await controller.sendPersistedText(conversation.id, '你好')

    expect(didAccept).toBe(true)
    expect(apiMock.sendPersistedMessage).toHaveBeenCalledWith({
      clientMessageId: userMessage.id,
      text: '你好',
    })
    expect(useChatStore.getState().messagesByConversation[conversation.id]).toEqual([
      persistedMessage,
    ])
    expect(useChatStore.getState().runsByConversation[conversation.id]?.phase).toBe('idle')
  })
})
