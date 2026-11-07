import { Text, View } from '@tarojs/components'

import type { Conversation } from '@/service/types'

import './conversation-list.scss'

interface ConversationListProps {
  conversations: Conversation[]
  onOpen: (conversationId: string) => void
}

export default function ConversationList({
  conversations,
  onOpen,
}: ConversationListProps) {
  return (
    <View className='conversation-list'>
      {conversations.map(conversation => (
        <View
          key={conversation.id}
          className='conversation-list__item'
          onClick={() => onOpen(conversation.id)}
        >
          <View className='conversation-list__content'>
            <Text className='conversation-list__title'>{conversation.title}</Text>
            <Text className='conversation-list__preview'>
              {conversation.lastMessagePreview || '继续这次对话'}
            </Text>
          </View>
          <Text className='conversation-list__time'>
            {formatConversationTime(conversation.lastMessageAt ?? conversation.updatedAt)}
          </Text>
        </View>
      ))}
    </View>
  )
}

function formatConversationTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return `${date.getMonth() + 1}/${date.getDate()}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
