import { describe, expect, it } from 'vitest'

import { Utf8StreamDecoder } from '@/shared/api/sse/utf8'

describe('Utf8StreamDecoder', () => {
  it('decodes Chinese text split across chunks', () => {
    const decoder = new Utf8StreamDecoder()
    const bytes = new TextEncoder().encode('你好，AI')

    expect(decoder.push(bytes.slice(0, 2))).toBe('')
    expect(decoder.push(bytes.slice(2))).toBe('你好，AI')
  })

  it('rejects incomplete trailing bytes on flush', () => {
    const decoder = new Utf8StreamDecoder()
    decoder.push(new Uint8Array([0xe4, 0xbd]))

    expect(() => decoder.flush()).toThrow('Incomplete UTF-8 sequence')
  })
})
