import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useChatDetailPage } from '@/pages/chat/useChatDetailPage'

const { controllerMock, detailModel, routerParams } = vi.hoisted(() => ({
  controllerMock: {
    loadPersistedMessages: vi.fn(),
    retryGeneration: vi.fn(),
    sendPersistedText: vi.fn().mockResolvedValue(true),
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
  default: {
    reLaunch: vi.fn(),
  },
  useRouter: () => ({ params: routerParams }),
}))

vi.mock('@/features/auth/public', () => ({
  useAuthUser: () => ({
    id: '11111111-1111-4111-8111-111111111111',
    nickname: '微信用户',
    status: 'active',
    createdAt: '2026-11-07T10:00:00.000Z',
  }),
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

  it('owns route lifecycle and persisted chat commands', async () => {
    const { result } = renderHook(() => useChatDetailPage())

    await waitFor(() => {
      expect(controllerMock.loadPersistedMessages).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
      )
    })
    expect(result.current.model.initialPrompt).toBe('你好')

    act(() => {
      result.current.actions.reloadMessages()
    })
    expect(controllerMock.loadPersistedMessages).toHaveBeenCalledTimes(2)

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
    expect(controllerMock.sendPersistedText).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      '继续',
    )
  })
})
