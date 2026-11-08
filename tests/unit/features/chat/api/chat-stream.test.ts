import { beforeEach, describe, expect, it, vi } from 'vitest'

import { parseChatRunEvent, streamRunEvents } from '@/features/chat/api/chat-stream'

interface StreamOptions {
  url: string
  onMessage: (message: { data: string }) => void
}

const { streamSseMock } = vi.hoisted(() => ({
  streamSseMock: vi.fn<(options: StreamOptions) => { abort: () => void }>(),
}))

vi.mock('@/shared/api/sse', () => ({
  streamSse: streamSseMock,
}))
vi.mock('@/shared/api/openapi-request', () => ({
  getConfiguredAccessToken: () => null,
}))

describe('chatStream', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps generic SSE payloads into validated, ordered chat events', () => {
    const onEvent = vi.fn()
    let transportOptions: StreamOptions | undefined
    streamSseMock.mockImplementation((options) => {
      transportOptions = options
      return { abort: vi.fn() }
    })
    streamRunEvents({ runId: 'run/1', after: 4, onEvent })

    if (!transportOptions) {
      throw new Error('Missing SSE transport options')
    }
    expect(transportOptions.url).toContain('/api/v1/runs/run%2F1/events?after=4')
    const payload = JSON.stringify({
      sequence: 1,
      type: 'delta',
      runId: 'run/1',
      messageId: 'message-1',
      data: { text: 'hello' },
    })
    transportOptions.onMessage({ data: payload })
    transportOptions.onMessage({ data: payload })

    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        sequence: 1,
        type: 'delta',
      }),
    )
  })

  it('rejects structurally invalid chat event payloads', () => {
    expect(() =>
      parseChatRunEvent('{"sequence":1,"type":"delta","runId":"run-1","data":{}}'),
    ).toThrow('Invalid SSE event')
  })
})
