import Taro from '@tarojs/taro'

import { API_BASE_URL } from '@/config'
import { useAuthStore } from '@/store/auth'

import { SseParser } from './parser'
import type { ChatRunEvent } from './types'
import { Utf8StreamDecoder } from './utf8'

export interface StreamRunEventsOptions {
  runId: string
  after?: number
  onEvent: (event: ChatRunEvent) => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

export interface StreamConnection {
  abort: () => void
}

export function streamRunEvents(options: StreamRunEventsOptions): StreamConnection {
  if (process.env.TARO_ENV !== 'weapp') {
    throw new Error('SSE chunk transport is currently enabled for WeChat only')
  }

  const parser = new SseParser()
  const decoder = new Utf8StreamDecoder()
  let closed = false
  const accessToken = useAuthStore.getState().session?.accessToken

  const task = Taro.request<ArrayBuffer>({
    url: `${API_BASE_URL}/api/v1/runs/${options.runId}/events`,
    method: 'GET',
    data: options.after ? { after: options.after } : undefined,
    header: {
      Accept: 'text/event-stream',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    enableChunked: true,
    responseType: 'arraybuffer',
    success: response => {
      if (closed) {
        return
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        options.onError?.(new Error(`SSE HTTP ${response.statusCode}`))
        return
      }
      try {
        const remaining = decoder.flush()
        if (remaining) {
          parser.push(remaining).forEach(event => options.onEvent(event))
        }
      }
      catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)))
        return
      }
      parser.flush().forEach(event => options.onEvent(event))
      options.onComplete?.()
    },
    fail: error => {
      if (!closed) {
        options.onError?.(new Error(error.errMsg || 'SSE connection failed'))
      }
    },
  })

  const listener = (chunk: { data: ArrayBuffer }) => {
    if (closed) {
      return
    }
    try {
      const text = decoder.push(new Uint8Array(chunk.data))
      parser.push(text).forEach(event => options.onEvent(event))
    }
    catch (error) {
      closed = true
      task.offChunkReceived(listener)
      task.abort()
      options.onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }

  task.onChunkReceived(listener)

  return {
    abort: () => {
      if (closed) {
        return
      }
      closed = true
      task.offChunkReceived(listener)
      task.abort()
    },
  }
}
