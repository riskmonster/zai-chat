export interface AuthUser {
  id: string
  nickname: string
  avatarUrl?: string
  status: 'active' | 'disabled'
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
  user: AuthUser
}
