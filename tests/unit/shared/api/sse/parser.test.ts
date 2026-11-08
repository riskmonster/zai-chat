import { describe, expect, it } from 'vitest'

import { SseParser } from '@/shared/api/sse/parser'

describe('SseParser', () => {
  it('parses an SSE message split across chunks without knowing the payload schema', () => {
    const parser = new SseParser()

    expect(parser.push('id: 1\nevent: delta\ndata: {"text":')).toEqual([])
    expect(parser.push('"hello"}\n\n')).toEqual([
      {
        id: '1',
        event: 'delta',
        data: '{"text":"hello"}',
      },
    ])
  })

  it('joins multi-line data and ignores heartbeat comments and DONE markers', () => {
    const parser = new SseParser()

    expect(parser.push(': heartbeat\n\n')).toEqual([])
    expect(parser.push('data: line-1\ndata: line-2\n\n')).toEqual([
      {
        data: 'line-1\nline-2',
      },
    ])
    expect(parser.push('data: [DONE]\n\n')).toEqual([])
  })

  it('flushes a trailing event without a blank-line boundary', () => {
    const parser = new SseParser()

    expect(parser.push('event: heartbeat\ndata: ok')).toEqual([])
    expect(parser.flush()).toEqual([
      {
        event: 'heartbeat',
        data: 'ok',
      },
    ])
  })
})
