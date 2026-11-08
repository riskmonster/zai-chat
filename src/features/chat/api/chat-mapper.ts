import type {
  Conversation as ConversationDto,
  ConversationPage as ConversationPageDto,
  Message as MessageDto,
  MessagePage as MessagePageDto,
  Run as RunDto,
  SendMessageAccepted as SendMessageAcceptedDto,
} from '@/generated/openapi/types'

import type {
  Conversation,
  ConversationPage,
  Message,
  MessagePage,
  Run,
  SendMessageAccepted,
} from '../model/chat-types'

export function toConversation(dto: ConversationDto): Conversation {
  return {
    id: dto.id,
    title: dto.title,
    ...(dto.lastMessagePreview !== undefined ? { lastMessagePreview: dto.lastMessagePreview } : {}),
    ...(dto.lastMessageAt !== undefined ? { lastMessageAt: dto.lastMessageAt } : {}),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function toConversationPage(dto: ConversationPageDto): ConversationPage {
  return {
    items: dto.items.map(toConversation),
    ...(dto.nextCursor !== undefined ? { nextCursor: dto.nextCursor } : {}),
  }
}

export function toMessage(dto: MessageDto): Message {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    role: dto.role,
    content: {
      type: dto.content.type,
      text: dto.content.text,
    },
    status: dto.status,
    ...(dto.errorCode !== undefined ? { errorCode: dto.errorCode } : {}),
    createdAt: dto.createdAt,
    ...(dto.completedAt !== undefined ? { completedAt: dto.completedAt } : {}),
  }
}

export function toMessagePage(dto: MessagePageDto): MessagePage {
  return {
    items: dto.items.map(toMessage),
    ...(dto.nextCursor !== undefined ? { nextCursor: dto.nextCursor } : {}),
  }
}

export function toRun(dto: RunDto): Run {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    userMessageId: dto.userMessageId,
    assistantMessageId: dto.assistantMessageId,
    status: dto.status,
    modelAlias: dto.modelAlias,
    ...(dto.errorCode !== undefined ? { errorCode: dto.errorCode } : {}),
    createdAt: dto.createdAt,
    ...(dto.completedAt !== undefined ? { completedAt: dto.completedAt } : {}),
  }
}

export function toSendMessageAccepted(dto: SendMessageAcceptedDto): SendMessageAccepted {
  return {
    userMessage: toMessage(dto.userMessage),
    assistantMessageId: dto.assistantMessageId,
    runId: dto.runId,
  }
}
