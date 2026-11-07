import { beforeEach, describe, expect, it, vi } from 'vitest'

import { streamRunEvents } from '@/services/sse'

const { requestMock, task } = vi.hoisted(() => {
  const requestTask = {
    abort: vi.fn(),
    offChunkReceived: vi.fn(),
    onChunkReceived: vi.fn(),
  }

  return {
    task: requestTask,
    requestMock: vi.fn(() => requestTask),
  }
})

vi.mock('@tarojs/taro', () => ({
  default: {
    request: requestMock,
    getStorageSync: vi.fn(() => null),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}))

describe('streamRunEvents', () => {
  beforeEach(() => {
    process.env.TARO_ENV = 'weapp'
    vi.clearAllMocks()
  })

  it('enables chunked Taro.request and forwards parsed deltas', () => {
    const onEvent = vi.fn()
    streamRunEvents({ runId: 'run_1', onEvent })

    expect(requestMock).toHaveBeenCalledWith(expect.objectContaining({
      enableChunked: true,
      responseType: 'arraybuffer',
    }))

    const listener = task.onChunkReceived.mock.calls[0][0]
    const event = JSON.stringify({
      sequence: 1,
      type: 'delta',
      runId: 'run_1',
      messageId: 'msg_1',
      data: { text: 'hello' },
    })
    const bytes = new TextEncoder().encode(`data: ${event}\n\n`)

    listener({ data: bytes.buffer })

    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'delta',
      data: { text: 'hello' },
    }))
  })

  it('removes the listener and aborts the task', () => {
    const connection = streamRunEvents({ runId: 'run_1', onEvent: vi.fn() })
    connection.abort()

    expect(task.offChunkReceived).toHaveBeenCalled()
    expect(task.abort).toHaveBeenCalled()
  })
})
