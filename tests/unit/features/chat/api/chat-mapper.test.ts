import { describe, expect, it } from 'vitest'

import { toConversation, toMessage, toRun } from '@/features/chat/api/chat-mapper'

describe('chat mappers', () => {
  it('maps generated conversation DTOs without leaking transport-only state', () => {
    const conversation = toConversation({
      id: 'conversation-1',
      title: '测试会话',
      lastMessagePreview: '你好',
      lastMessageAt: '2026-11-07T10:00:00.000Z',
      createdAt: '2026-11-07T09:00:00.000Z',
      updatedAt: '2026-11-07T10:00:00.000Z',
    })

    expect(conversation).toEqual({
      id: 'conversation-1',
      title: '测试会话',
      lastMessagePreview: '你好',
      lastMessageAt: '2026-11-07T10:00:00.000Z',
      createdAt: '2026-11-07T09:00:00.000Z',
      updatedAt: '2026-11-07T10:00:00.000Z',
    })
  })

  it('maps nested message content into domain content', () => {
    const message = toMessage({
      id: 'message-1',
      conversationId: 'conversation-1',
      role: 'assistant',
      content: { type: 'text', text: '回答' },
      status: 'completed',
      createdAt: '2026-11-07T10:00:00.000Z',
      completedAt: '2026-11-07T10:00:01.000Z',
    })

    expect(message.content).toEqual({ type: 'text', text: '回答' })
    expect(message.completedAt).toBe('2026-11-07T10:00:01.000Z')
  })

  it('maps run snapshots used for stream reconciliation', () => {
    const run = toRun({
      id: 'run-1',
      conversationId: 'conversation-1',
      userMessageId: 'user-1',
      assistantMessageId: 'assistant-1',
      status: 'streaming',
      modelAlias: 'default',
      createdAt: '2026-11-07T10:00:00.000Z',
    })

    expect(run.status).toBe('streaming')
    expect(run.modelAlias).toBe('default')
  })
})
