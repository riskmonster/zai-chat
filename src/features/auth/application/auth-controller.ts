import Taro from '@tarojs/taro'

import { toAppError } from '@/shared/lib/errors'

import { authApi, type AuthApi } from '../api/auth-api'
import type { AuthSession, AuthUser } from '../model/auth-types'
import { useAuthStore } from '../store/auth-store'

export interface AuthControllerDependencies {
  api?: AuthApi
  login?: () => Promise<string>
  store?: typeof useAuthStore
}

export interface AuthController {
  loginWithWechat: (privacyVersion: string) => Promise<AuthSession>
  refreshSession: () => Promise<AuthSession | null>
  logout: () => Promise<void>
  getSession: () => AuthSession | null
  getUser: () => AuthUser | null
}

async function requestWechatCode(): Promise<string> {
  const result = await Taro.login()
  if (!result.code) {
    throw new Error('未获取到微信登录凭证')
  }
  return result.code
}

export function createAuthController({
  api = authApi,
  login = requestWechatCode,
  store = useAuthStore,
}: AuthControllerDependencies = {}): AuthController {
  return {
    async loginWithWechat(privacyVersion) {
      const version = privacyVersion.trim()
      if (version.length === 0) {
        throw toAppError('请先同意隐私政策', 'REQUEST_FAILED')
      }
      try {
        const code = await login()
        const session = await api.login(code, version)
        store.getState().setSession(session)
        return session
      } catch (error) {
        throw toAppError(error, 'NETWORK_ERROR')
      }
    },

    async refreshSession() {
      const current = store.getState().session
      if (current === null) {
        return null
      }
      try {
        const session = await api.refresh(current.refreshToken)
        store.getState().setSession(session)
        return session
      } catch (error) {
        store.getState().clearSession()
        throw toAppError(error, 'AUTH_EXPIRED')
      }
    },

    async logout() {
      try {
        if (store.getState().session !== null) {
          await api.logout()
        }
      } finally {
        store.getState().clearSession()
      }
    },

    getSession() {
      return store.getState().session
    },

    getUser() {
      return store.getState().session?.user ?? null
    },
  }
}

export const authController = createAuthController()
