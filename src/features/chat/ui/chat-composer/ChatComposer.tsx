import type { ReactElement } from 'react'

import { ArrowUp, Button, StopCircle, Text, Textarea, View } from '@/shared/ui/shell'

import type { ChatComposerProps } from './ChatComposer.model'
import { useChatComposer } from './useChatComposer'

import './chat-composer.scss'

export default function ChatComposer(props: ChatComposerProps): ReactElement {
  const { errorMessage } = props
  const {
    draft,
    isRunning,
    isStopping,
    isSubmitting,
    canSubmit,
    primaryLabel,
    handleInput,
    handlePrimaryAction,
  } = useChatComposer(props)

  return (
    <View className='chat-composer'>
      <Textarea
        className='chat-composer-input'
        ariaLabel='输入消息'
        value={draft}
        maxlength={2000}
        autoHeight
        showConfirmBar={false}
        placeholder='输入消息'
        onChange={handleInput}
      />
      {errorMessage !== undefined && errorMessage.length > 0 ? (
        <Text className='chat-composer-error'>{errorMessage}</Text>
      ) : null}
      <View className='chat-composer-footer'>
        <Text className='chat-composer-count'>{draft.length}/2000</Text>
        <Button
          size='small'
          shape='round'
          color={isRunning || isStopping ? 'danger' : 'primary'}
          loading={isSubmitting}
          icon={isRunning || isStopping ? <StopCircle /> : <ArrowUp />}
          disabled={!isRunning && !canSubmit}
          onClick={handlePrimaryAction}
        >
          {primaryLabel}
        </Button>
      </View>
    </View>
  )
}
