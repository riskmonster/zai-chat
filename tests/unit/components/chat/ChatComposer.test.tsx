import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ChatComposer from '@/components/chat/ChatComposer'

afterEach(cleanup)

vi.mock('@tarojs/components', async () => {
  const React = await import('react')
  const View = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props, children)
  const Text = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
    React.createElement('span', props, children)
  const Textarea = ({
    onInput,
    value,
    maxlength,
    autoHeight: _autoHeight,
    showConfirmBar: _showConfirmBar,
    ...props
  }: {
    onInput?: (event: { detail: { value: string } }) => void
    value?: string
    maxlength?: number
    autoHeight?: boolean
    showConfirmBar?: boolean
  }) => React.createElement('textarea', {
    ...props,
    value,
    maxLength: maxlength,
    onChange: event => onInput?.({
      detail: {
        value: (event.target as HTMLTextAreaElement).value,
      },
    }),
  })

  return { View, Text, Textarea }
})

vi.mock('@taroify/core/button', async () => {
  const React = await import('react')
  return {
    default: ({
      children,
      icon: _icon,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }) =>
      React.createElement('button', props, children),
  }
})

describe('ChatComposer', () => {
  it('clears the draft after a successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    const { container } = render(
      <ChatComposer
        status='idle'
        onSubmit={onSubmit}
        onStop={vi.fn()}
      />,
    )
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: '你好' } })
    fireEvent.click(screen.getByText('发送'))

    await waitFor(() => expect(textarea.value).toBe(''))
    expect(onSubmit).toHaveBeenCalledWith('你好')
  })

  it('preserves the draft when submit fails', async () => {
    const { container } = render(
      <ChatComposer
        status='idle'
        onSubmit={vi.fn().mockResolvedValue(false)}
        onStop={vi.fn()}
      />,
    )
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: '不要丢失' } })
    fireEvent.click(screen.getByText('发送'))

    await waitFor(() => expect(textarea.value).toBe('不要丢失'))
  })

  it('switches the primary action to stop while streaming', () => {
    const onStop = vi.fn()
    render(
      <ChatComposer
        status='streaming'
        onSubmit={vi.fn()}
        onStop={onStop}
      />,
    )

    fireEvent.click(screen.getByText('停止'))

    expect(onStop).toHaveBeenCalledOnce()
  })
})
