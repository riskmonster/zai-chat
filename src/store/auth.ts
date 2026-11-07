import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthSession } from '@/service/types'

export type { AuthSession }

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
