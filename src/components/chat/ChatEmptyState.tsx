import { Text, View } from '@tarojs/components'

import './chat-empty-state.scss'

interface ChatEmptyStateProps {
  suggestions: string[]
  onSelectSuggestion: (prompt: string) => void
}

export default function ChatEmptyState({
  suggestions,
  onSelectSuggestion,
}: ChatEmptyStateProps) {
  return (
    <View className='chat-empty-state'>
      <Text className='chat-empty-state__title'>还没有对话</Text>
      <Text className='chat-empty-state__copy'>试试这些问题，或直接开始输入。</Text>
      <View className='chat-empty-state__starters'>
        {suggestions.map(prompt => (
          <View
            key={prompt}
            className='chat-empty-state__starter'
            onClick={() => onSelectSuggestion(prompt)}
          >
            <Text>{prompt}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
