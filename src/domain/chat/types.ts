import type { AppError } from '@/domain/errors'
import type {
  Conversation,
  Message,
  Run,
} from '@/service/types'

export type LoadPhase = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type ChatRunPhase =
  | 'idle'
  | 'submitting'
  | 'queued'
  | 'streaming'
  | 'stopping'
  | 'completed'
  | 'failed'
  | 'cancelled'

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
  conversationCursor?: string
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
