import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { authStorage } from '../persistence/auth-storage'
import type { AuthSession } from '../model/auth-types'

interface AuthState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => authStorage),
    },
  ),
)

export function getAuthAccessToken(): string | null {
  return useAuthStore.getState().session?.accessToken ?? null
}

export function clearAuthSession(): void {
  useAuthStore.getState().clearSession()
}
