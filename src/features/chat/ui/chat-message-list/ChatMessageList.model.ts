import type { ChatMessageView } from '../../model/chat-view-model'

export interface ChatMessageListProps {
  messages: ChatMessageView[]
  canRetry: boolean
  errorMessage: string | null
  onRetry: () => void
}

export interface ChatMessageListModel {
  messages: ChatMessageView[]
  isEmpty: boolean
  canRetry: boolean
  errorMessage: string
}

export interface ChatMessageListActions {
  handleRetry: () => void
}

export const CHAT_MESSAGE_LIST_COPY = {
  title: 'AI 助手',
  emptyDescription: '输入一个问题开始对话，回答会实时显示在这里。',
  thinking: '正在思考',
  streamingCursor: '▍',
  retry: '重新生成',
  retryFallback: '生成未完成，请重试',
} as const
