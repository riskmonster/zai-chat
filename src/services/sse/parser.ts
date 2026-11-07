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
    || !event.runId
    || !EVENT_TYPES.has(event.type)
  ) {
    throw new Error('Invalid SSE event')
  }

  return event
}

export class SseParser {
  private buffer = ''

  push(chunk: string): ChatRunEvent[] {
    this.buffer += chunk.replace(/\r\n/g, '\n')
    const events: ChatRunEvent[] = []
    let boundary = this.buffer.indexOf('\n\n')

    while (boundary >= 0) {
      const block = this.buffer.slice(0, boundary)
      this.buffer = this.buffer.slice(boundary + 2)
      const event = parseBlock(block)
      if (event) {
        events.push(event)
      }
      boundary = this.buffer.indexOf('\n\n')
    }

    return events
  }

  flush(): ChatRunEvent[] {
    const event = parseBlock(this.buffer)
    this.buffer = ''
    return event ? [event] : []
  }
}
