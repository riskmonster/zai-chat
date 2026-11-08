import type { SseMessage } from './types'

function parseBlock(block: string): SseMessage | null {
  const dataLines: string[] = []
  let event: string | undefined
  let id: string | undefined

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    } else if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('id:')) {
      id = line.slice(3).trim()
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  const data = dataLines.join('\n')
  if (data === '[DONE]') {
    return null
  }

  return {
    ...(event !== undefined && event.length > 0 ? { event } : {}),
    ...(id !== undefined && id.length > 0 ? { id } : {}),
    data,
  }
}

export class SseParser {
  private buffer = ''

  push(chunk: string): SseMessage[] {
    this.buffer += chunk.replace(/\r\n/g, '\n')
    const messages: SseMessage[] = []
    let boundary = this.buffer.indexOf('\n\n')

    while (boundary >= 0) {
      const block = this.buffer.slice(0, boundary)
      this.buffer = this.buffer.slice(boundary + 2)
      const message = parseBlock(block)
      if (message) {
        messages.push(message)
      }
      boundary = this.buffer.indexOf('\n\n')
    }

    return messages
  }

  flush(): SseMessage[] {
    const message = parseBlock(this.buffer)
    this.buffer = ''
    return message ? [message] : []
  }
}
