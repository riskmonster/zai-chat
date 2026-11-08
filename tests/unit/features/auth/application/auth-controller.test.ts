import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthApi } from '@/features/auth/api/auth-api'
import { createAuthController } from '@/features/auth/application/auth-controller'
import type { AuthSession } from '@/features/auth/model/auth-types'
import { useAuthStore } from '@/features/auth/store/auth-store'

vi.mock('@tarojs/taro', () => ({
  default: {
    login: vi.fn(),
    getStorageSync: vi.fn(() => ''),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}))

const session: AuthSession = {
  accessToken: 'access-token',
  accessTokenExpiresIn: 900,
  refreshToken: 'refresh-token',
  refreshTokenExpiresIn: 2_592_000,
  user: {
    id: '11111111-1111-4111-8111-111111111111',
    nickname: '微信用户',
    status: 'active',
    createdAt: '2026-11-08T10:00:00.000Z',
  },
}

describe('authController', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
  })

  it('exchanges a WeChat code and persists the application session', async () => {
    const loginRequest = vi.fn().mockResolvedValue(session)
    const api: AuthApi = {
      login: loginRequest,
      refresh: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    }
    const controller = createAuthController({
      api,
      login: vi.fn().mockResolvedValue('wx-code'),
    })

    await expect(controller.loginWithWechat('2026-11')).resolves.toEqual(session)
    expect(loginRequest).toHaveBeenCalledWith('wx-code', '2026-11')
    expect(useAuthStore.getState().session).toEqual(session)
  })

  it('clears the session when refresh fails', async () => {
    useAuthStore.setState({ session })
    const api: AuthApi = {
      login: vi.fn(),
      refresh: vi.fn().mockRejectedValue(new Error('expired')),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    }
    const controller = createAuthController({ api })

    await expect(controller.refreshSession()).rejects.toMatchObject({
      code: 'AUTH_EXPIRED',
    })
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('clears local credentials after logout', async () => {
    useAuthStore.setState({ session })
    const logoutRequest = vi.fn().mockResolvedValue(undefined)
    const api: AuthApi = {
      login: vi.fn(),
      refresh: vi.fn(),
      logout: logoutRequest,
      getCurrentUser: vi.fn(),
    }
    const controller = createAuthController({ api })

    await controller.logout()

    expect(logoutRequest).toHaveBeenCalledOnce()
    expect(useAuthStore.getState().session).toBeNull()
  })
})
