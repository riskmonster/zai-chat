import type { ReactElement } from 'react'

import { Button, Replay, Text, View } from '@/shared/ui/shell'

import { CHAT_MESSAGE_LIST_COPY, type ChatMessageListProps } from './ChatMessageList.model'
import { useChatMessageList } from './useChatMessageList'

import './chat-message-list.scss'

export default function ChatMessageList(props: ChatMessageListProps): ReactElement {
  const { messages, isEmpty, canRetry, errorMessage, handleRetry } = useChatMessageList(props)

  if (isEmpty) {
    return (
      <View className='chat-message-list chat-message-list--empty'>
        <Text className='chat-message-list__welcome-title'>{CHAT_MESSAGE_LIST_COPY.title}</Text>
        <Text className='chat-message-list__welcome-copy'>
          {CHAT_MESSAGE_LIST_COPY.emptyDescription}
        </Text>
      </View>
    )
  }

  return (
    <View className='chat-message-list'>
      {messages.map((message) => (
        <View
          key={message.id}
          className={`chat-message chat-message--${message.role}`}
        >
          <View className='chat-message__bubble'>
            {message.isThinking ? (
              <Text className='chat-message__thinking'>{CHAT_MESSAGE_LIST_COPY.thinking}</Text>
            ) : (
              <Text>{message.text}</Text>
            )}
            {message.isStreaming && !message.isThinking ? (
              <Text className='chat-message__cursor'>{CHAT_MESSAGE_LIST_COPY.streamingCursor}</Text>
            ) : null}
          </View>
          {message.stateLabel !== null && message.stateLabel.length > 0 ? (
            <Text
              className={`chat-message__state${message.isErrorState ? ' chat-message__state--error' : ''}`}
            >
              {message.stateLabel}
            </Text>
          ) : null}
        </View>
      ))}
      {canRetry ? (
        <View className='chat-message__error'>
          <Text className='chat-message__error-copy'>{errorMessage}</Text>
          <Button
            className='chat-message__retry'
            variant='text'
            size='small'
            icon={<Replay />}
            onClick={handleRetry}
          >
            {CHAT_MESSAGE_LIST_COPY.retry}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
