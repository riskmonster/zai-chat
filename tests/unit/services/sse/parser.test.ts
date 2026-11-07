import { describe, expect, it } from 'vitest'

import { SseParser } from '@/services/sse/parser'

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

  it('ignores duplicate sequence numbers', () => {
    const parser = new SseParser()
    const event = JSON.stringify({
      sequence: 1,
      type: 'delta',
      runId: 'run_1',
      messageId: 'msg_1',
      data: { text: 'hello' },
    })

    expect(parser.push(`data: ${event}\n\n`)).toHaveLength(1)
    expect(parser.push(`data: ${event}\n\n`)).toHaveLength(0)
  })

  it('rejects structurally invalid event data', () => {
    const parser = new SseParser()

    expect(() => parser.push(
      'data: {"sequence":1,"type":"delta","runId":"run_1","data":{}}\n\n',
    )).toThrow('Invalid SSE event')
  })
})
