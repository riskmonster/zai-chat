import type { ReactElement } from 'react'

import { Button, Text, View } from '@/shared/ui/shell'

import { CHAT_EMPTY_STATE_COPY, type ChatEmptyStateProps } from './ChatEmptyState.model'
import { useChatEmptyState } from './useChatEmptyState'

import './chat-empty-state.scss'

export default function ChatEmptyState(props: ChatEmptyStateProps): ReactElement {
  const { suggestions } = props
  const { handleSelectSuggestion } = useChatEmptyState(props)

  return (
    <View className='chat-empty-state'>
      <Text className='chat-empty-state__title'>{CHAT_EMPTY_STATE_COPY.title}</Text>
      <Text className='chat-empty-state__copy'>{CHAT_EMPTY_STATE_COPY.description}</Text>
      <View className='chat-empty-state__starters'>
        {suggestions.map((prompt) => (
          <Button
            key={prompt}
            className='chat-empty-state__starter'
            variant='text'
            block
            onClick={() => {
              handleSelectSuggestion(prompt)
            }}
          >
            {prompt}
          </Button>
        ))}
      </View>
    </View>
  )
}
