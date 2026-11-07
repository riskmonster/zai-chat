import { Text, View } from '@tarojs/components'

import type { ChatRunPhase } from '@/domain/chat/types'
import type { AppError } from '@/domain/errors'
import type { Message } from '@/service/types'

import './chat-message-list.scss'

interface ChatMessageListProps {
  messages: Message[]
  runPhase: ChatRunPhase
  runError: AppError | null
  onRetry: () => void
}

export default function ChatMessageList({
  messages,
  runPhase,
  runError,
  onRetry,
}: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <View className='chat-message-list chat-message-list--empty'>
        <Text className='chat-message-list__welcome-title'>AI 助手</Text>
        <Text className='chat-message-list__welcome-copy'>
          输入一个问题开始对话，回答会实时显示在这里。
        </Text>
      </View>
    )
  }

  const canRetry = runPhase === 'failed' || runPhase === 'cancelled'

  return (
    <View className='chat-message-list'>
      {messages.map((message) => {
        const isUser = message.role === 'user'
        const isStreaming = message.role === 'assistant'
          && message.status === 'streaming'
        const isEmptyAssistant = message.role === 'assistant'
          && !message.content.text
          && (message.status === 'pending' || message.status === 'streaming')

        return (
          <View
            key={message.id}
            className={`chat-message chat-message--${isUser ? 'user' : 'assistant'}`}
          >
            <View className='chat-message__bubble'>
              {isEmptyAssistant
                ? <Text className='chat-message__thinking'>正在思考</Text>
                : <Text>{message.content.text}</Text>}
              {isStreaming && !isEmptyAssistant
                ? <Text className='chat-message__cursor'>▍</Text>
                : null}
            </View>
            {message.status === 'cancelled'
              ? <Text className='chat-message__state'>已停止</Text>
              : null}
            {message.status === 'failed'
              ? <Text className='chat-message__state chat-message__state--error'>生成失败</Text>
              : null}
          </View>
        )
      })}
      {canRetry
        ? (
            <View className='chat-message__error'>
              <Text className='chat-message__error-copy'>
                {runError?.message ?? '生成未完成，请重试'}
              </Text>
              <Text className='chat-message__retry' onClick={onRetry}>重新生成</Text>
            </View>
          )
        : null}
    </View>
  )
}
