import type { ChatRunEvent } from './types'

const EVENT_TYPES = new Set([
  'meta',
  'delta',
  'usage',
  'done',
  'error',
  'heartbeat',
])

function parseBlock(block: string): ChatRunEvent | null {
  const dataLines: string[] = []

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  const payload = dataLines.join('\n')
  if (payload === '[DONE]') {
    return null
  }

  const event = JSON.parse(payload) as ChatRunEvent
  if (
    !Number.isInteger(event.sequence)
    || event.sequence < 0
    || !event.runId
    || !EVENT_TYPES.has(event.type)
    || !isValidEventData(event)
  ) {
    throw new Error('Invalid SSE event')
  }

  return event
}

export class SseParser {
  private buffer = ''
  private lastSequence = -1

  push(chunk: string): ChatRunEvent[] {
    this.buffer += chunk.replace(/\r\n/g, '\n')
    const events: ChatRunEvent[] = []
    let boundary = this.buffer.indexOf('\n\n')

    while (boundary >= 0) {
      const block = this.buffer.slice(0, boundary)
      this.buffer = this.buffer.slice(boundary + 2)
      const event = parseBlock(block)
      if (event && event.sequence > this.lastSequence) {
        this.lastSequence = event.sequence
        events.push(event)
      }
      boundary = this.buffer.indexOf('\n\n')
    }

    return events
  }

  flush(): ChatRunEvent[] {
    const event = parseBlock(this.buffer)
    this.buffer = ''
    if (!event || event.sequence <= this.lastSequence) {
      return []
    }
    this.lastSequence = event.sequence
    return [event]
  }
}

function isValidEventData(event: ChatRunEvent): boolean {
  switch (event.type) {
    case 'meta':
      return isNonEmptyString(event.data.messageId)
        && isNonEmptyString(event.data.modelAlias)
        && isNonEmptyString(event.data.requestId)
    case 'delta':
      return typeof event.data.text === 'string'
    case 'usage':
      return Number.isFinite(event.data.inputTokens)
        && Number.isFinite(event.data.outputTokens)
    case 'done':
      return ['completed', 'cancelled', 'failed'].includes(event.data.status)
        && isNonEmptyString(event.data.completedAt)
    case 'error':
      return isNonEmptyString(event.data.code)
        && isNonEmptyString(event.data.message)
        && typeof event.data.retryable === 'boolean'
    case 'heartbeat':
      return isNonEmptyString(event.data.serverTime)
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}
