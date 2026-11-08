import Taro from '@tarojs/taro'

import { SseParser } from './parser'
import type { SseMessage } from './types'
import { Utf8StreamDecoder } from './utf8'

export interface StreamSseOptions {
  url: string
  getAccessToken?: () => string | null
  onMessage: (message: SseMessage) => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

export interface StreamConnection {
  abort: () => void
}

export function streamSse(options: StreamSseOptions): StreamConnection {
  if (process.env.TARO_ENV !== 'weapp') {
    throw new Error('SSE chunk transport is currently enabled for WeChat only')
  }

  const parser = new SseParser()
  const decoder = new Utf8StreamDecoder()
  let isClosed = false
  const accessToken = options.getAccessToken?.() ?? null

  const task = Taro.request<ArrayBuffer>({
    url: options.url,
    method: 'GET',
    header: {
      Accept: 'text/event-stream',
      ...(accessToken !== null && accessToken.length > 0
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    enableChunked: true,
    responseType: 'arraybuffer',
    success: (response) => {
      if (isClosed) {
        return
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        options.onError?.(new Error(`SSE HTTP ${String(response.statusCode)}`))
        return
      }
      try {
        const remaining = decoder.flush()
        if (remaining) {
          parser.push(remaining).forEach((message) => {
            options.onMessage(message)
          })
        }
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)))
        return
      }
      parser.flush().forEach((message) => {
        options.onMessage(message)
      })
      options.onComplete?.()
    },
    fail: (error) => {
      if (!isClosed) {
        options.onError?.(new Error(error.errMsg || 'SSE connection failed'))
      }
    },
  })

  const listener = (chunk: { data: ArrayBuffer }) => {
    if (isClosed) {
      return
    }
    try {
      const text = decoder.push(new Uint8Array(chunk.data))
      parser.push(text).forEach((message) => {
        options.onMessage(message)
      })
    } catch (error) {
      isClosed = true
      task.offChunkReceived(listener)
      task.abort()
      options.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }

  task.onChunkReceived(listener)

  return {
    abort: () => {
      if (isClosed) {
        return
      }
      isClosed = true
      task.offChunkReceived(listener)
      task.abort()
    },
  }
}
