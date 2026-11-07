import { describe, expect, it } from 'vitest'

import type { ChatRunEvent } from '@/services/sse/types'
import type { Message, Run } from '@/service/types'

import { chatDomainReducer } from '@/domain/chat/reducer'
import { createInitialChatDomainState } from '@/domain/chat/types'

const conversationId = '11111111-1111-4111-8111-111111111111'
const userId = '22222222-2222-4222-8222-222222222222'
const assistantId = '33333333-3333-4333-8333-333333333333'
const runId = '44444444-4444-4444-8444-444444444444'

describe('chatDomainReducer', () => {
  it('merges streamed deltas, ignores duplicate sequences, and completes the run', () => {
    const userMessage: Message = {
      id: userId,
      conversationId,
      role: 'user',
      content: { type: 'text', text: '你好' },
      status: 'pending',
      createdAt: '2026-11-07T10:00:00.000Z',
    }

    let state = chatDomainReducer(createInitialChatDomainState(), {
      type: 'send_accepted',
      conversationId,
      userMessage,
      assistantMessageId: assistantId,
      runId,
    })

    state = chatDomainReducer(state, {
      type: 'run_event',
      conversationId,
      event: event({
        sequence: 1,
        type: 'delta',
        messageId: assistantId,
        data: { text: '你' },
      }),
    })
    state = chatDomainReducer(state, {
      type: 'run_event',
      conversationId,
      event: event({
        sequence: 2,
        type: 'delta',
        messageId: assistantId,
        data: { text: '好' },
      }),
    })
    state = chatDomainReducer(state, {
      type: 'run_event',
      conversationId,
      event: event({
        sequence: 2,
        type: 'delta',
        messageId: assistantId,
        data: { text: '重复' },
      }),
    })
    state = chatDomainReducer(state, {
      type: 'run_event',
      conversationId,
      event: event({
        sequence: 3,
        type: 'done',
        messageId: assistantId,
        data: {
          status: 'completed',
          completedAt: '2026-11-07T10:00:02.000Z',
        },
      }),
    })

    expect(state.messagesByConversation[conversationId][1].content.text).toBe('你好')
    expect(state.runsByConversation[conversationId].phase).toBe('completed')
  })

  it('marks a run as failed when an SSE error event arrives', () => {
    let state = chatDomainReducer(createInitialChatDomainState(), {
      type: 'run_snapshot',
      conversationId,
      run: runSnapshot('streaming'),
    })
    state = chatDomainReducer(state, {
      type: 'run_event',
      conversationId,
      event: event({
        sequence: 1,
        type: 'error',
        messageId: assistantId,
        data: {
          code: 'MODEL_UNAVAILABLE',
          message: '模型暂时不可用',
          retryable: true,
        },
      }),
    })

    expect(state.runsByConversation[conversationId].phase).toBe('failed')
    expect(state.runsByConversation[conversationId].error).toMatchObject({
      code: 'MODEL_UNAVAILABLE',
      retryable: true,
    })
  })
})

function event<T extends ChatRunEvent['type']>(
  input: Omit<Extract<ChatRunEvent, { type: T }>, 'runId'>,
): ChatRunEvent {
  return {
    ...input,
    runId,
  } as ChatRunEvent
}

function runSnapshot(status: Run['status']): Run {
  return {
    id: runId,
    conversationId,
    userMessageId: userId,
    assistantMessageId: assistantId,
    status,
    modelAlias: 'default',
    createdAt: '2026-11-07T10:00:00.000Z',
  }
}
