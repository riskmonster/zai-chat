import { useAuthStore } from '../store/auth-store'
import type { AuthUser } from '../model/auth-types'

export function useAuthUser(): AuthUser | null {
  return useAuthStore((state) => state.session?.user ?? null)
}
