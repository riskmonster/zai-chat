import Taro, { useDidShow } from '@tarojs/taro'

import { useHasSession } from '@/features/auth/public'
import { chatController, useConversationListModel } from '@/features/chat/public'

import { CHAT_STARTERS, type ChatListPageController } from './chat-list-page.model'

export function useChatListPage(): ChatListPageController {
  const hasSession = useHasSession()
  const model = useConversationListModel()

  useDidShow(() => {
    if (hasSession) {
      void chatController.loadConversations()
    }
  })

  const startNewConversation = (prompt?: string) => {
    const query =
      prompt !== undefined && prompt.length > 0 ? `?prompt=${encodeURIComponent(prompt)}` : ''
    void Taro.navigateTo({ url: `/pages/chat/detail${query}` })
  }

  const openHistoryConversation = (conversationId: string) => {
    void chatController.openConversation(conversationId)
    void Taro.navigateTo({
      url: `/pages/chat/detail?conversationId=${encodeURIComponent(conversationId)}`,
    })
  }

  const reloadConversations = () => {
    void chatController.loadConversations()
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
