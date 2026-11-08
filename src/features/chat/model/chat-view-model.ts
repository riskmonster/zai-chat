import type { Conversation, Message } from './chat-types'

export interface ConversationView {
  id: string
  title: string
  preview: string
  timeLabel: string
}

export interface ChatMessageView {
  id: string
  role: 'user' | 'assistant'
  text: string
  isStreaming: boolean
  isThinking: boolean
  stateLabel: string | null
  isErrorState: boolean
}

export function toConversationViews(conversations: Conversation[]): ConversationView[] {
  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    preview: conversation.lastMessagePreview ?? '继续这次对话',
    timeLabel: formatConversationTime(conversation.lastMessageAt ?? conversation.updatedAt),
  }))
}

export function toChatMessageViews(messages: Message[]): ChatMessageView[] {
  return messages.map((message) => {
    const role = message.role === 'user' ? 'user' : 'assistant'
    const isThinking =
      role === 'assistant' &&
      !message.content.text &&
      (message.status === 'pending' || message.status === 'streaming')

    let stateLabel: string | null = null
    if (message.status === 'cancelled') {
      stateLabel = '已停止'
    } else if (message.status === 'failed') {
      stateLabel = '生成失败'
    }

    return {
      id: message.id,
      role,
      text: message.content.text,
      isStreaming: role === 'assistant' && message.status === 'streaming',
      isThinking,
      stateLabel,
      isErrorState: message.status === 'failed',
    }
  })
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

  return `${String(date.getMonth() + 1)}/${String(date.getDate())}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
