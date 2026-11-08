import { beforeEach, describe, expect, it, vi } from 'vitest'

import { streamSse } from '@/shared/api/sse'

type ChunkListener = (chunk: { data: ArrayBuffer }) => void

interface RequestOptions {
  enableChunked?: boolean
  responseType?: string
  header?: Record<string, string>
}

interface RequestTaskMock {
  abort: ReturnType<typeof vi.fn<() => void>>
  offChunkReceived: ReturnType<typeof vi.fn<(listener: ChunkListener) => void>>
  onChunkReceived: ReturnType<typeof vi.fn<(listener: ChunkListener) => void>>
}

const { requestMock, task } = vi.hoisted(() => {
  const requestTask = {
    abort: vi.fn<() => void>(),
    offChunkReceived: vi.fn<(listener: ChunkListener) => void>(),
    onChunkReceived: vi.fn<(listener: ChunkListener) => void>(),
  }

  return {
    task: requestTask,
    requestMock: vi.fn<(options: RequestOptions) => RequestTaskMock>(() => requestTask),
  }
})

vi.mock('@tarojs/taro', () => ({
  default: {
    request: requestMock,
  },
}))

describe('streamSse', () => {
  beforeEach(() => {
    process.env.TARO_ENV = 'weapp'
    vi.clearAllMocks()
  })

  it('enables chunked Taro.request and forwards generic SSE messages', () => {
    const onMessage = vi.fn()
    streamSse({
      url: 'https://api.example.com/events',
      getAccessToken: () => 'token-1',
      onMessage,
    })

    const requestOptions = requestMock.mock.calls[0]?.[0]
    if (!requestOptions) {
      throw new Error('Missing request options')
    }
    expect(requestOptions.enableChunked).toBe(true)
    expect(requestOptions.responseType).toBe('arraybuffer')
    expect(requestOptions.header?.Accept).toBe('text/event-stream')
    expect(requestOptions.header?.Authorization).toBe('Bearer token-1')

    const listener = task.onChunkReceived.mock.calls[0]?.[0]
    expect(listener).toBeTypeOf('function')
    if (!listener) {
      throw new Error('Missing chunk listener')
    }
    const bytes = new TextEncoder().encode('event: delta\ndata: {"text":"hello"}\n\n')

    listener({ data: bytes.buffer })

    expect(onMessage).toHaveBeenCalledWith({
      event: 'delta',
      data: '{"text":"hello"}',
    })
  })

  it('removes the listener and aborts the task', () => {
    const connection = streamSse({
      url: 'https://api.example.com/events',
      onMessage: vi.fn(),
    })
    connection.abort()

    expect(task.offChunkReceived).toHaveBeenCalled()
    expect(task.abort).toHaveBeenCalled()
  })
})
