import Button from '@taroify/core/button'
import { Text, Textarea, View } from '@tarojs/components'
import { useState } from 'react'

import AppIcon from '@/components/ui/AppIcon'
import type { ChatRunPhase } from '@/domain/chat/types'

import './chat-composer.scss'

interface ChatComposerProps {
  status: ChatRunPhase
  initialDraft?: string
  errorMessage?: string
  onSubmit: (text: string) => Promise<boolean> | boolean
  onStop: () => void
}

export default function ChatComposer({
  status,
  initialDraft = '',
  errorMessage,
  onSubmit,
  onStop,
}: ChatComposerProps) {
  const [draft, setDraft] = useState(initialDraft)
  const [waitingForSubmit, setWaitingForSubmit] = useState(false)
  const isRunning = status === 'queued' || status === 'streaming'
  const isStopping = status === 'stopping'
  const isSubmitting = waitingForSubmit || status === 'submitting'
  const canSubmit = !isRunning
    && !isStopping
    && !isSubmitting
    && draft.trim().length > 0

  const submit = async () => {
    if (!canSubmit) {
      return
    }

    const content = draft.trim()
    setWaitingForSubmit(true)
    try {
      const accepted = await onSubmit(content)
      if (accepted) {
        setDraft('')
      }
    }
    finally {
      setWaitingForSubmit(false)
    }
  }

  const primaryAction = isRunning ? onStop : submit
  const primaryLabel = isRunning
    ? '停止'
    : isStopping
      ? '停止中'
      : isSubmitting
        ? '发送中'
        : '发送'

  return (
    <View className='chat-composer'>
      <Textarea
        className='chat-composer-input'
        value={draft}
        maxlength={2000}
        autoHeight
        showConfirmBar={false}
        placeholder='输入消息'
        onInput={event => setDraft(event.detail.value)}
      />
      {errorMessage
        ? <Text className='chat-composer-error'>{errorMessage}</Text>
        : null}
      <View className='chat-composer-footer'>
        <Text className='chat-composer-count'>{draft.length}/2000</Text>
        <Button
          size='small'
          shape='round'
          color={isRunning || isStopping ? 'danger' : 'primary'}
          icon={(
            <AppIcon
              name={isRunning || isStopping ? 'stop' : 'send'}
              className='chat-composer-icon'
            />
          )}
          disabled={!isRunning && !canSubmit}
          onClick={primaryAction}
        >
          {primaryLabel}
        </Button>
      </View>
    </View>
  )
}
