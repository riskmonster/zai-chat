import type { StreamConnection, StreamRunEventsOptions } from '@/services/sse'
import { streamRunEvents } from '@/services/sse'
import {
  conversationsConversationIdMessagesUsingGet,
  conversationsConversationIdMessagesUsingPost,
  conversationsUsingGet,
  conversationsUsingPost,
  runsRunIdCancelUsingPost,
  runsRunIdRetryUsingPost,
  runsRunIdUsingGet,
} from '@/service'
import type {
  Conversation,
  ConversationPage,
  MessagePage,
  Run,
  SendMessageAccepted,
} from '@/service/types'

export interface SendMessageInput {
  conversationId: string
  clientMessageId: string
  text: string
}

export interface StreamRunInput extends Omit<StreamRunEventsOptions, 'runId'> {
  runId: string
}

export interface ChatApi {
  listConversations(input?: {
    cursor?: string
    limit?: number
  }): Promise<ConversationPage>
  createConversation(title?: string): Promise<Conversation>
  listMessages(input: {
    conversationId: string
    cursor?: string
    limit?: number
  }): Promise<MessagePage>
  sendMessage(input: SendMessageInput): Promise<SendMessageAccepted>
  getRun(runId: string): Promise<Run>
  cancelRun(runId: string): Promise<Run>
  retryRun(runId: string): Promise<Run>
  streamRun(input: StreamRunInput): StreamConnection
}

export const chatApi: ChatApi = {
  listConversations({ cursor, limit = 20 } = {}) {
    return conversationsUsingGet({
      params: { cursor, limit },
    })
  },
  createConversation(title) {
    return conversationsUsingPost({
      body: title ? { title } : {},
    })
  },
  listMessages({ conversationId, cursor, limit = 20 }) {
    return conversationsConversationIdMessagesUsingGet({
      params: {
        conversationId,
        cursor,
        limit,
      },
    })
  },
  sendMessage({ conversationId, clientMessageId, text }) {
    return conversationsConversationIdMessagesUsingPost({
      params: { conversationId },
      body: {
        clientMessageId,
        content: {
          type: 'text',
          text,
        },
        stream: true,
      },
    })
  },
  getRun(runId) {
    return runsRunIdUsingGet({
      params: { runId },
    })
  },
  cancelRun(runId) {
    return runsRunIdCancelUsingPost({
      params: { runId },
    })
  },
  retryRun(runId) {
    return runsRunIdRetryUsingPost({
      params: { runId },
      body: {},
    })
  },
  streamRun(input) {
    return streamRunEvents(input)
  },
}
