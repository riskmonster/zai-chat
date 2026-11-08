import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useChatListPage } from '@/pages/chat/useChatListPage'

const { controllerMock, didShowCallbackRef, model, navigateToMock } = vi.hoisted(() => ({
  controllerMock: {
    loadConversations: vi.fn(),
    openConversation: vi.fn(),
  },
  didShowCallbackRef: { current: undefined as undefined | (() => void) },
  model: {
    conversations: [],
    conversationPhase: 'empty' as const,
    conversationError: null,
  },
  navigateToMock: vi.fn(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    navigateTo: navigateToMock,
  },
  useDidShow: (callback: () => void) => {
    didShowCallbackRef.current = callback
  },
}))

vi.mock('@/features/auth/public', () => ({
  useHasSession: () => true,
}))

vi.mock('@/features/chat/public', () => ({
  chatController: controllerMock,
  useConversationListModel: () => model,
}))

describe('useChatListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    didShowCallbackRef.current = undefined
  })

  it('owns page show loading, navigation and retry interactions', () => {
    const { result } = renderHook(() => useChatListPage())

    act(() => didShowCallbackRef.current?.())
    expect(controllerMock.loadConversations).toHaveBeenCalledOnce()

    act(() => {
      result.current.actions.startNewConversation('帮我整理计划')
    })
    expect(navigateToMock).toHaveBeenCalledWith({
      url: '/pages/chat/detail?prompt=%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E8%AE%A1%E5%88%92',
    })

    act(() => {
      result.current.actions.openHistoryConversation('conversation-1')
    })
    expect(controllerMock.openConversation).toHaveBeenCalledWith('conversation-1')
    expect(navigateToMock).toHaveBeenLastCalledWith({
      url: '/pages/chat/detail?conversationId=conversation-1',
    })

    act(() => {
      result.current.actions.reloadConversations()
    })
    expect(controllerMock.loadConversations).toHaveBeenCalledTimes(2)
  })
})
