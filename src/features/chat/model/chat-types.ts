import type { AppError } from '@/shared/lib/errors'

type LoadPhase = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type ChatRunPhase =
  'idle' | 'submitting' | 'queued' | 'streaming' | 'stopping' | 'completed' | 'failed' | 'cancelled'

export interface Conversation {
  id: string
  title: string
  lastMessagePreview?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface ConversationPage {
  items: Conversation[]
  nextCursor?: string
}

interface MessageContent {
  type: 'text'
  text: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: MessageContent
  status: 'pending' | 'streaming' | 'completed' | 'cancelled' | 'failed'
  errorCode?: string
  createdAt: string
  completedAt?: string
}

export interface MessagePage {
  items: Message[]
  nextCursor?: string
}

export interface Run {
  id: string
  conversationId: string
  userMessageId: string
  assistantMessageId: string
  status: 'queued' | 'streaming' | 'completed' | 'cancelled' | 'failed'
  modelAlias: string
  errorCode?: string
  createdAt: string
  completedAt?: string
}

export interface SendMessageAccepted {
  userMessage: Message
  assistantMessageId: string
  runId: string
}

export interface ConversationRunState {
  phase: ChatRunPhase
  runId?: string
  userMessageId?: string
  assistantMessageId?: string
  lastSequence: number
  error: AppError | null
}

export interface ChatDomainState {
  conversations: Conversation[]
  conversationCursor: string | undefined
  conversationPhase: LoadPhase
  conversationError: AppError | null
  messagesByConversation: Record<string, Message[]>
  messagePhaseByConversation: Record<string, LoadPhase>
  messageErrorByConversation: Record<string, AppError | null>
  messageCursorByConversation: Record<string, string | undefined>
  runsByConversation: Record<string, ConversationRunState>
  activeConversationId: string | null
}

export const createIdleRunState = (): ConversationRunState => ({
  phase: 'idle',
  lastSequence: -1,
  error: null,
})

export function createInitialChatDomainState(): ChatDomainState {
  return {
    conversations: [],
    conversationCursor: undefined,
    conversationPhase: 'idle',
    conversationError: null,
    messagesByConversation: {},
    messagePhaseByConversation: {},
    messageErrorByConversation: {},
    messageCursorByConversation: {},
    runsByConversation: {},
    activeConversationId: null,
  }
}

export function mapRunStatusToPhase(run: Run): ChatRunPhase {
  return run.status
}
