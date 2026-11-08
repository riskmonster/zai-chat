import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import request, {
  configureApiClient,
  resetApiClientConfiguration,
} from '@/shared/api/openapi-request'

interface RequestResult {
  statusCode: number
  header: Record<string, string>
  data: unknown
}

interface RequestOptions {
  url: string
  header: Record<string, string>
}

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn<(options: RequestOptions) => Promise<RequestResult>>(),
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    request: requestMock,
  },
}))

describe('openapi request adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetApiClientConfiguration()
  })

  it('injects transport configuration without reading application stores', async () => {
    configureApiClient({
      baseUrl: 'https://api.example.com',
      getAccessToken: () => 'token-1',
      onUnauthorized: vi.fn(),
    })
    requestMock.mockResolvedValue({
      statusCode: 200,
      header: {},
      data: {
        code: 0,
        message: 'ok',
        requestId: 'request-1',
        data: { items: [] },
      },
    })

    await request('/api/v1/conversations', {
      method: 'GET',
      params: { limit: 20 },
    })

    const requestOptions = requestMock.mock.calls[0]?.[0]
    if (!requestOptions) {
      throw new Error('Missing request options')
    }
    expect(requestOptions.url).toBe('https://api.example.com/api/v1/conversations?limit=20')
    expect(requestOptions.header.Authorization).toBe('Bearer token-1')
  })

  it('notifies the composition root when authentication expires', async () => {
    const onUnauthorized = vi.fn()
    configureApiClient({
      baseUrl: 'https://api.example.com',
      getAccessToken: () => 'expired',
      onUnauthorized,
    })
    requestMock.mockResolvedValue({
      statusCode: 401,
      header: {},
      data: {
        code: 'AUTH_EXPIRED',
        message: '登录已过期',
        requestId: 'request-1',
      },
    })

    await expect(
      request('/api/v1/conversations', {
        method: 'GET',
      }),
    ).rejects.toMatchObject({
      code: 'AUTH_EXPIRED',
      statusCode: 401,
    })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
