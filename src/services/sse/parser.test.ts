import { describe, expect, it } from 'vitest'

import { SseParser } from './parser'

describe('SseParser', () => {
  it('parses an SSE event split across chunks', () => {
    const parser = new SseParser()
    const event = JSON.stringify({
      sequence: 1,
      type: 'delta',
      runId: 'run_1',
      messageId: 'msg_1',
      data: { text: '你好' },
    })

    expect(parser.push(`id: 1\nevent: delta\ndata: ${event.slice(0, 20)}`)).toEqual([])
    expect(parser.push(`${event.slice(20)}\n\n`)).toEqual([{
      sequence: 1,
      type: 'delta',
      runId: 'run_1',
      messageId: 'msg_1',
      data: { text: '你好' },
    }])
  })

  it('ignores heartbeat comments and DONE markers', () => {
    const parser = new SseParser()

    expect(parser.push(': heartbeat\n\n')).toEqual([])
    expect(parser.push('data: [DONE]\n\n')).toEqual([])
  })

  it('rejects malformed events', () => {
    const parser = new SseParser()

    expect(() => parser.push('data: {"sequence":1}\n\n')).toThrow('Invalid SSE event')
  })
})
