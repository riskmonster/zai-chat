import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useChatDetailPage } from '@/pages/chat/useChatDetailPage'

const { controllerMock, detailModel, routerParams } = vi.hoisted(() => ({
  controllerMock: {
    openConversation: vi.fn(),
    startNewConversation: vi.fn(),
    loadMessages: vi.fn(),
    retryGeneration: vi.fn(),
    sendText: vi.fn().mockResolvedValue(true),
    stopGeneration: vi.fn(),
  },
  detailModel: {
    conversationId: 'conversation-1',
    messages: [],
    runPhase: 'idle' as const,
    runError: null,
    messageError: null,
    canRetry: false,
  },
  routerParams: {
    conversationId: 'conversation-1',
    prompt: '你好',
  },
}))

vi.mock('@tarojs/taro', () => ({
  useRouter: () => ({ params: routerParams }),
}))

vi.mock('@/features/chat/public', () => ({
  chatController: controllerMock,
  useChatDetailModel: () => detailModel,
}))

describe('useChatDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routerParams.conversationId = 'conversation-1'
    routerParams.prompt = '你好'
  })

  it('owns route lifecycle and chat commands', async () => {
    const { result } = renderHook(() => useChatDetailPage())

    await waitFor(() => {
      expect(controllerMock.openConversation).toHaveBeenCalledWith('conversation-1')
    })
    expect(result.current.model.initialPrompt).toBe('你好')

    act(() => {
      result.current.actions.reloadMessages()
    })
    expect(controllerMock.loadMessages).toHaveBeenCalledWith('conversation-1')

    act(() => {
      result.current.actions.retryGeneration()
    })
    expect(controllerMock.retryGeneration).toHaveBeenCalledWith('conversation-1')

    act(() => {
      result.current.actions.stopGeneration()
    })
    expect(controllerMock.stopGeneration).toHaveBeenCalledWith('conversation-1')

    await act(async () => {
      await result.current.actions.sendText('继续')
    })
    expect(controllerMock.sendText).toHaveBeenCalledWith('conversation-1', '继续')
  })
})
