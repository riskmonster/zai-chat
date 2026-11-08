import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useChatComposer } from '@/features/chat/ui/chat-composer/useChatComposer'

describe('useChatComposer', () => {
  it('owns input, submit and success state', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    const { result } = renderHook(() =>
      useChatComposer({
        status: 'idle',
        onSubmit,
        onStop: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleInput({ detail: { value: '你好' } })
    })
    expect(result.current.draft).toBe('你好')
    expect(result.current.canSubmit).toBe(true)

    act(() => {
      result.current.handlePrimaryAction()
    })

    await waitFor(() => {
      expect(result.current.draft).toBe('')
    })
    expect(onSubmit).toHaveBeenCalledWith('你好')
  })

  it('keeps the draft when submit is rejected', async () => {
    const { result } = renderHook(() =>
      useChatComposer({
        status: 'idle',
        onSubmit: vi.fn().mockResolvedValue(false),
        onStop: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleInput({ detail: { value: '不要丢失' } })
    })
    act(() => {
      result.current.handlePrimaryAction()
    })

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    })
    expect(result.current.draft).toBe('不要丢失')
  })

  it('routes the primary action to stop while streaming', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() =>
      useChatComposer({
        status: 'streaming',
        onSubmit: vi.fn(),
        onStop,
      }),
    )

    act(() => {
      result.current.handlePrimaryAction()
    })

    expect(result.current.isRunning).toBe(true)
    expect(onStop).toHaveBeenCalledOnce()
  })

  it('guards against duplicate submits before the next render', async () => {
    let resolveSubmit: ((accepted: boolean) => void) | undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    const { result } = renderHook(() =>
      useChatComposer({
        status: 'idle',
        onSubmit,
        onStop: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleInput({ detail: { value: '只发送一次' } })
    })
    act(() => {
      result.current.handlePrimaryAction()
      result.current.handlePrimaryAction()
    })

    expect(onSubmit).toHaveBeenCalledOnce()
    act(() => {
      resolveSubmit?.(true)
    })
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    })
  })
})
