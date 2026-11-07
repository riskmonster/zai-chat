import Taro from '@tarojs/taro'

import { API_BASE_URL } from '@/config'
import { AppError, toAppError } from '@/domain/errors'
import { useAuthStore } from '@/store/auth'

interface ApiResponse<T> {
  code: number
  message: string
  requestId: string
  data: T
}

interface ApiErrorResponse {
  code: string
  message: string
  requestId: string
}

export interface CustomRequestOptions_ {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, unknown>
  headers?: Record<string, string>
  header?: Record<string, string>
  data?: unknown
  timeout?: number
}

function appendQuery(url: string, query?: Record<string, unknown>) {
  if (!query) {
    return url
  }

  const search = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  if (!search) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}${search}`
}

type UnwrapResponse<T> = T extends { data?: infer D } ? D : T

export default async function request<T>(
  url: string,
  options: CustomRequestOptions_,
): Promise<UnwrapResponse<T>> {
  const method = options.method || 'GET'
  const params = options.params
  const requestUrl = appendQuery(`${API_BASE_URL}${url}`, params)

  const token = useAuthStore.getState().session?.accessToken
  let response
  try {
    response = await Taro.request<ApiResponse<UnwrapResponse<T>> | ApiErrorResponse>({
      url: requestUrl,
      method,
      timeout: options.timeout || 60000,
      data: method === 'GET' ? undefined : options.data,
      header: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
        ...options.headers,
      },
    })
  }
  catch (error) {
    throw toAppError(error, 'NETWORK_ERROR')
  }

  if (response.statusCode === 204) {
    return undefined as UnwrapResponse<T>
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    const body = response.data as ApiErrorResponse
    if (response.statusCode === 401) {
      useAuthStore.getState().clearSession()
    }
    throw createResponseError(
      response.statusCode,
      body,
      getHeader(response.header, 'retry-after'),
    )
  }

  const body = response.data as ApiResponse<UnwrapResponse<T>>
  if (body.code !== 0) {
    throw new AppError({
      code: 'REQUEST_FAILED',
      message: body.message || '请求失败',
      requestId: body.requestId,
      statusCode: response.statusCode,
    })
  }

  return body.data
}

function createResponseError(
  statusCode: number,
  body: ApiErrorResponse,
  retryAfterHeader?: string,
): AppError {
  if (statusCode === 401) {
    return new AppError({
      code: body.code || 'AUTH_EXPIRED',
      message: body.message || '登录已过期',
      requestId: body.requestId,
      statusCode,
    })
  }

  if (statusCode === 429) {
    const retryAfterSeconds = Number.parseInt(retryAfterHeader ?? '', 10)
    return new AppError({
      code: body.code || 'RATE_LIMITED',
      message: body.message || '请求过于频繁，请稍后再试',
      requestId: body.requestId,
      statusCode,
      retryAfterSeconds: Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds
        : undefined,
      retryable: true,
    })
  }

  return new AppError({
    code: body.code || (statusCode >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED'),
    message: body.message || `HTTP ${statusCode}`,
    requestId: body.requestId,
    statusCode,
    retryable: statusCode >= 500,
  })
}

function getHeader(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined
  }
  const target = name.toLowerCase()
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === target)
  return entry?.[1]
}
