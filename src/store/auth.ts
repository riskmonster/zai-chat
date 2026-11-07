import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AuthSession {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: {
    id: string
    nickname: string
    avatarUrl?: string
    status: 'active' | 'disabled'
    createdAt: string
  }
}

interface AuthState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      session: null,
      setSession: session => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => ({
        getItem: key => Taro.getStorageSync(key) || null,
        setItem: (key, value) => Taro.setStorageSync(key, value),
        removeItem: key => Taro.removeStorageSync(key),
      })),
    },
  ),
)
