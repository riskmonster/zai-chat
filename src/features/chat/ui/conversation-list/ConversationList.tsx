import type { ReactElement } from 'react'

import { Text, View } from '@/shared/ui/shell'

import type { ConversationListProps } from './ConversationList.model'
import { useConversationList } from './useConversationList'

import './conversation-list.scss'

export default function ConversationList(props: ConversationListProps): ReactElement {
  const { conversations } = props
  const { handleOpen } = useConversationList(props)

  return (
    <View className='conversation-list'>
      {conversations.map((conversation) => (
        <View
          key={conversation.id}
          className='conversation-list__item'
          onClick={() => {
            handleOpen(conversation.id)
          }}
        >
          <View className='conversation-list__content'>
            <Text className='conversation-list__title'>{conversation.title}</Text>
            <Text className='conversation-list__preview'>{conversation.preview}</Text>
          </View>
          <Text className='conversation-list__time'>{conversation.timeLabel}</Text>
        </View>
      ))}
    </View>
  )
}
