import Button from '@taroify/core/button'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'

import ChatEmptyState from '@/components/chat/ChatEmptyState'
import ConversationList from '@/components/chat/ConversationList'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'

import './index.scss'

const STARTERS = [
  '帮我整理今天的计划',
  '解释一个复杂概念',
  '把这段文字改得更清晰',
]

export default function ChatListPage() {
  const hasSession = useAuthStore(state => Boolean(state.session))
  const conversations = useChatStore(state => state.conversations)
  const conversationPhase = useChatStore(state => state.conversationPhase)
  const conversationError = useChatStore(state => state.conversationError)
  const loadConversations = useChatStore(state => state.loadConversations)
  const openConversation = useChatStore(state => state.openConversation)

  useDidShow(() => {
    if (hasSession) {
      void loadConversations()
    }
  })

  const startNewConversation = (prompt?: string) => {
    const query = prompt ? `?prompt=${encodeURIComponent(prompt)}` : ''
    Taro.navigateTo({ url: `/pages/chat/detail${query}` })
  }

  const openHistoryConversation = (conversationId: string) => {
    void openConversation(conversationId)
    Taro.navigateTo({
      url: `/pages/chat/detail?conversationId=${encodeURIComponent(conversationId)}`,
    })
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
        <Button block color='primary' onClick={() => startNewConversation()}>
          开始新对话
        </Button>
      </View>

      {conversationPhase === 'loading'
        ? <Text className='chat-list-status'>正在同步会话…</Text>
        : null}

      {conversationError
        ? (
            <View className='chat-list-error'>
              <Text className='chat-list-error__copy'>{conversationError.message}</Text>
              <Text
                className='chat-list-error__retry'
                onClick={() => void loadConversations()}
              >
                重试
              </Text>
            </View>
          )
        : null}

      {conversations.length > 0
        ? (
            <ConversationList
              conversations={conversations}
              onOpen={openHistoryConversation}
            />
          )
        : (
            <ChatEmptyState
              suggestions={STARTERS}
              onSelectSuggestion={startNewConversation}
            />
          )}
    </View>
  )
}
