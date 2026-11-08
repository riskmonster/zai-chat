import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ChatComposer from '@/features/chat/ui/chat-composer/ChatComposer'

vi.mock('@/shared/ui/shell', async () => {
  const React = await import('react')
  const View = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props, children)
  const Text = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) =>
    React.createElement('span', props, children)
  const Textarea = ({
    onChange,
    value,
    maxlength,
    ariaLabel,
    autoHeight: _autoHeight,
    showConfirmBar: _showConfirmBar,
    ...props
  }: {
    onChange?: (event: { detail: { value: string } }) => void
    value?: string
    maxlength?: number
    ariaLabel?: string
    autoHeight?: boolean
    showConfirmBar?: boolean
  }) =>
    React.createElement('textarea', {
      ...props,
      value,
      maxLength: maxlength,
      'aria-label': ariaLabel,
      onChange: (event) =>
        onChange?.({
          detail: {
            value: (event.target as HTMLTextAreaElement).value,
          },
        }),
    })
  const Button = ({
    children,
    icon: _icon,
    loading: _loading,
    color: _color,
    shape: _shape,
    size: _size,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode
    loading?: boolean
    color?: string
    shape?: string
    size?: string
  }) => React.createElement('button', props, children)
  const ArrowUp = () => React.createElement('span', { 'data-icon': 'send' })
  const StopCircle = () => React.createElement('span', { 'data-icon': 'stop' })

  return { ArrowUp, Button, StopCircle, Text, Textarea, View }
})

describe('ChatComposer', () => {
  it('clears the draft after a successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(
      <ChatComposer
        status='idle'
        onSubmit={onSubmit}
        onStop={vi.fn()}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: '输入消息' })

    fireEvent.change(textarea, { target: { value: '你好' } })
    fireEvent.click(screen.getByText('发送'))

    await waitFor(() => expect(textarea).toHaveValue(''))
    expect(onSubmit).toHaveBeenCalledWith('你好')
  })

  it('preserves the draft when submit fails', async () => {
    render(
      <ChatComposer
        status='idle'
        onSubmit={vi.fn().mockResolvedValue(false)}
        onStop={vi.fn()}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: '输入消息' })

    fireEvent.change(textarea, { target: { value: '不要丢失' } })
    fireEvent.click(screen.getByText('发送'))

    await waitFor(() => expect(textarea).toHaveValue('不要丢失'))
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
