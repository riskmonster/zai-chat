import Taro from '@tarojs/taro'

import { API_BASE_URL } from '@/config'
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
  const response = await Taro.request<ApiResponse<UnwrapResponse<T>> | ApiErrorResponse>({
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

  if (response.statusCode === 204) {
    return undefined as UnwrapResponse<T>
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    const body = response.data as ApiErrorResponse
    throw new Error(body.message || `HTTP ${response.statusCode}`)
  }

  const body = response.data as ApiResponse<UnwrapResponse<T>>
  if (body.code !== 0) {
    throw new Error(body.message || '请求失败')
  }

  return body.data
}
