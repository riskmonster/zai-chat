import {
  conversationsConversationIdMessagesUsingGet,
  conversationsConversationIdMessagesUsingPost,
  conversationsUsingGet,
  conversationsUsingPost,
  messagesUsingGet,
  messagesUsingPost,
  runsRunIdCancelUsingPost,
  runsRunIdRetryUsingPost,
  runsRunIdUsingGet,
} from '@/generated/openapi'

import type {
  Conversation,
  ConversationPage,
  Message,
  MessagePage,
  Run,
  SendMessageAccepted,
} from '../model/chat-types'
import {
  toConversation,
  toConversationPage,
  toMessagePage,
  toPersistedMessage,
  toPersistedMessagePage,
  toRun,
  toSendMessageAccepted,
} from './chat-mapper'
import { streamRunEvents, type StreamRunEventsOptions } from './chat-stream'

export type { StreamConnection, StreamRunEventsOptions } from './chat-stream'

interface SendMessageInput {
  conversationId: string
  clientMessageId: string
  text: string
}

interface StreamRunInput extends Omit<StreamRunEventsOptions, 'runId'> {
  runId: string
}

export interface ChatApi {
  listConversations(input?: { cursor?: string; limit?: number }): Promise<ConversationPage>
  createConversation(title?: string): Promise<Conversation>
  listMessages(input: {
    conversationId: string
    cursor?: string
    limit?: number
  }): Promise<MessagePage>
  sendMessage(input: SendMessageInput): Promise<SendMessageAccepted>
  listPersistedMessages(input?: { cursor?: string; limit?: number }): Promise<MessagePage>
  sendPersistedMessage(input: { clientMessageId: string; text: string }): Promise<Message>
  getRun(runId: string): Promise<Run>
  cancelRun(runId: string): Promise<Run>
  retryRun(runId: string): Promise<Run>
  streamRun(input: StreamRunInput): ReturnType<typeof streamRunEvents>
}

export const chatApi: ChatApi = {
  async listConversations({ cursor, limit = 20 } = {}) {
    const page = await conversationsUsingGet({
      params: {
        limit,
        ...(cursor !== undefined ? { cursor } : {}),
      },
    })
    return toConversationPage(page)
  },
  async createConversation(title) {
    const conversation = await conversationsUsingPost({
      body: title !== undefined && title.length > 0 ? { title } : {},
    })
    return toConversation(conversation)
  },
  async listMessages({ conversationId, cursor, limit = 20 }) {
    const page = await conversationsConversationIdMessagesUsingGet({
      params: {
        conversationId,
        limit,
        ...(cursor !== undefined ? { cursor } : {}),
      },
    })
    return toMessagePage(page)
  },
  async sendMessage({ conversationId, clientMessageId, text }) {
    const accepted = await conversationsConversationIdMessagesUsingPost({
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
    return toSendMessageAccepted(accepted)
  },
  async listPersistedMessages({ cursor, limit = 20 } = {}) {
    const page = await messagesUsingGet({
      params: {
        limit,
        ...(cursor !== undefined ? { cursor } : {}),
      },
    })
    return toPersistedMessagePage(page)
  },
  async sendPersistedMessage({ clientMessageId, text }) {
    const response = await messagesUsingPost({
      body: {
        clientMessageId,
        content: {
          type: 'text',
          text,
        },
      },
    })
    return toPersistedMessage(response.message)
  },
  async getRun(runId) {
    return toRun(
      await runsRunIdUsingGet({
        params: { runId },
      }),
    )
  },
  async cancelRun(runId) {
    return toRun(
      await runsRunIdCancelUsingPost({
        params: { runId },
      }),
    )
  },
  async retryRun(runId) {
    return toRun(
      await runsRunIdRetryUsingPost({
        params: { runId },
        body: {},
      }),
    )
  },
  streamRun(input) {
    return streamRunEvents(input)
  },
}
