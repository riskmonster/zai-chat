import { streamSse, type StreamConnection } from '@/shared/api/sse'
import { getConfiguredAccessToken } from '@/shared/api/openapi-request'
import { API_BASE_URL } from '@/shared/config/environment'

import type { ChatRunEvent } from '../model/chat-events'

export type { StreamConnection } from '@/shared/api/sse'

const EVENT_TYPES = new Set(['meta', 'delta', 'usage', 'done', 'error', 'heartbeat'])

export interface StreamRunEventsOptions {
  runId: string
  after?: number
  getAccessToken?: () => string | null
  onEvent: (event: ChatRunEvent) => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function streamRunEvents(options: StreamRunEventsOptions): StreamConnection {
  let lastSequence = -1
  const after =
    options.after !== undefined ? `?after=${encodeURIComponent(String(options.after))}` : ''
  const url = `${API_BASE_URL}/api/v1/runs/${encodeURIComponent(options.runId)}/events${after}`

  return streamSse({
    url,
    getAccessToken: options.getAccessToken ?? getConfiguredAccessToken,
    onMessage: (message) => {
      try {
        const event = parseChatRunEvent(message.data)
        if (event.sequence <= lastSequence) {
          return
        }
        lastSequence = event.sequence
        options.onEvent(event)
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    },
    ...(options.onError ? { onError: options.onError } : {}),
    ...(options.onComplete ? { onComplete: options.onComplete } : {}),
  })
}

export function parseChatRunEvent(payload: string): ChatRunEvent {
  const event = JSON.parse(payload) as ChatRunEvent
  if (
    !Number.isInteger(event.sequence) ||
    event.sequence < 0 ||
    !event.runId ||
    !EVENT_TYPES.has(event.type) ||
    !isValidEventData(event)
  ) {
    throw new Error('Invalid SSE event')
  }
  return event
}

function isValidEventData(event: ChatRunEvent): boolean {
  switch (event.type) {
    case 'meta':
      return (
        isNonEmptyString(event.data.messageId) &&
        isNonEmptyString(event.data.modelAlias) &&
        isNonEmptyString(event.data.requestId)
      )
    case 'delta':
      return typeof event.data.text === 'string'
    case 'usage':
      return Number.isFinite(event.data.inputTokens) && Number.isFinite(event.data.outputTokens)
    case 'done':
      return (
        ['completed', 'cancelled', 'failed'].includes(event.data.status) &&
        isNonEmptyString(event.data.completedAt)
      )
    case 'error':
      return (
        isNonEmptyString(event.data.code) &&
        isNonEmptyString(event.data.message) &&
        typeof event.data.retryable === 'boolean'
      )
    case 'heartbeat':
      return isNonEmptyString(event.data.serverTime)
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
