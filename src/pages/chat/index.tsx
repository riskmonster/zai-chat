import Button from '@taroify/core/button'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './index.scss'

const STARTERS = [
  '帮我整理今天的计划',
  '解释一个复杂概念',
  '把这段文字改得更清晰'
]

export default function ChatListPage() {
  const createConversation = () => {
    Taro.navigateTo({ url: '/pages/chat/detail' })
  }

  return (
    <View className='chat-list-page'>
      <View className='chat-list-heading'>
        <Text className='chat-list-eyebrow'>AI 助手</Text>
        <Text className='chat-list-title'>今天想聊什么？</Text>
        <Text className='chat-list-description'>
          用最少的步骤开始一次对话，历史会话会在这里继续。
        </Text>
      </View>

      <View className='chat-list-actions'>
        <Button block color='primary' onClick={createConversation}>
          开始新对话
        </Button>
      </View>

      <View className='chat-list-empty'>
        <Text className='chat-list-empty-title'>还没有对话</Text>
        <Text className='chat-list-empty-copy'>试试这些问题，或直接开始输入。</Text>
        <View className='chat-list-starters'>
          {STARTERS.map(prompt => (
            <View
              key={prompt}
              className='chat-list-starter'
              onClick={createConversation}
            >
              <Text>{prompt}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
