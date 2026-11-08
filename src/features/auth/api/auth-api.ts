import {
  authLogoutUsingPost,
  authRefreshUsingPost,
  authWxLoginUsingPost,
  usersMeUsingGet,
} from '@/generated/openapi'

import type { AuthSession, AuthUser } from '../model/auth-types'

export interface AuthApi {
  login(code: string, privacyVersion: string): Promise<AuthSession>
  refresh(refreshToken: string): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<AuthUser>
}

export const authApi: AuthApi = {
  async login(code, privacyVersion) {
    const session = await authWxLoginUsingPost({
      body: { code, privacyVersion },
    })
    return session
  },
  async refresh(refreshToken) {
    const session = await authRefreshUsingPost({
      body: { refreshToken },
    })
    return session
  },
  async logout() {
    await authLogoutUsingPost({})
  },
  async getCurrentUser() {
    return usersMeUsingGet({})
  },
}
