import Taro, { useDidShow } from '@tarojs/taro'

import { useAuthUser } from '@/features/auth/public'
import { chatController, useConversationListModel } from '@/features/chat/public'

import { CHAT_STARTERS, type ChatListPageController } from './chat-list-page.model'

export function useChatListPage(): ChatListPageController {
  const user = useAuthUser()
  const model = useConversationListModel()

  useDidShow(() => {
    if (user === null) {
      void Taro.reLaunch({ url: '/pages/login/index' })
      return
    }
    void chatController.loadDefaultConversation(user.id)
  })

  const startNewConversation = (prompt?: string) => {
    if (user === null) {
      void Taro.reLaunch({ url: '/pages/login/index' })
      return
    }
    const query =
      prompt !== undefined && prompt.length > 0 ? `?prompt=${encodeURIComponent(prompt)}` : ''
    const separator = query.length > 0 ? '&' : '?'
    void Taro.navigateTo({
      url: `/pages/chat/detail${query}${separator}conversationId=${encodeURIComponent(user.id)}`,
    })
  }

  const openHistoryConversation = (conversationId: string) => {
    if (user === null) {
      void Taro.reLaunch({ url: '/pages/login/index' })
      return
    }
    void chatController.loadPersistedMessages(user.id)
    void Taro.navigateTo({
      url: `/pages/chat/detail?conversationId=${encodeURIComponent(conversationId)}`,
    })
  }

  const reloadConversations = () => {
    if (user !== null) {
      void chatController.loadDefaultConversation(user.id)
    }
  }

  return {
    model,
    suggestions: CHAT_STARTERS,
    actions: {
      startNewConversation,
      openHistoryConversation,
      reloadConversations,
    },
  }
}
