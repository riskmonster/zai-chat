import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMePage } from '@/pages/me/useMePage'

const { showToastMock } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: showToastMock,
  },
}))

describe('useMePage', () => {
  it('owns the settings interaction', () => {
    const { result } = renderHook(() => useMePage())

    act(() => {
      result.current.actions.openSettings()
    })

    expect(showToastMock).toHaveBeenCalledWith({
      title: '设置页待实现',
      icon: 'none',
    })
  })
})
