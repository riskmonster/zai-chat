import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCustomTabBar } from '@/custom-tab-bar/useCustomTabBar'

const { getCurrentPagesMock, switchTabMock } = vi.hoisted(() => ({
  getCurrentPagesMock: vi.fn(() => [{ route: 'pages/chat/index' }]),
  switchTabMock: vi.fn(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: getCurrentPagesMock,
    switchTab: switchTabMock,
  },
}))

describe('useCustomTabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('owns selected state and tab navigation', () => {
    const { result } = renderHook(() => useCustomTabBar())

    expect(result.current.selectedIndex).toBe(0)
    act(() => {
      result.current.handleSwitchTab(1)
    })

    expect(result.current.selectedIndex).toBe(1)
    expect(switchTabMock).toHaveBeenCalledWith({ url: '/pages/me/index' })
  })
})
