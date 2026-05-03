import type {
  QQAvatar,
  QQCurrentUser,
} from './qq9Shell'

export interface AuthUserProfile {
  userId: string
  qqNumber: string
  displayName: string
  avatar: QQAvatar
  online: boolean
}

export interface AuthSessionSnapshot {
  authenticated: boolean
  user: AuthUserProfile | null
}

export interface AuthLoginRequest {
  account: string
  password: string
}

export interface AuthErrorPayload {
  error: 'INVALID_REQUEST' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED'
  message: string
}

export const toQQCurrentUser = (
  profile: AuthUserProfile
): QQCurrentUser => ({
  name: profile.displayName,
  avatar: profile.avatar,
  online: profile.online,
})
