import { useAuthStore } from '../store/auth-store'

export function useHasSession(): boolean {
  return useAuthStore((state) => Boolean(state.session))
}
