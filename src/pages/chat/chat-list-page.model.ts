import type { ConversationListModel } from '@/features/chat/public'

interface ChatListPageActions {
  startNewConversation: (prompt?: string) => void
  openHistoryConversation: (conversationId: string) => void
  reloadConversations: () => void
}

export interface ChatListPageController {
  model: ConversationListModel
  suggestions: readonly string[]
  actions: ChatListPageActions
}

export const CHAT_LIST_PAGE_COPY = {
  eyebrow: 'AI 助手',
  title: '今天想聊什么？',
  description: '用最少的步骤开始一次对话，历史会话会在这里继续。',
  startConversation: '开始新对话',
  loading: '正在同步会话...',
  retry: '重试',
} as const

export const CHAT_STARTERS = [
  '帮我整理今天的计划',
  '解释一个复杂概念',
  '把这段文字改得更清晰',
] as const
