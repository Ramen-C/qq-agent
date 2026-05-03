import type {
  AuthErrorPayload,
  AuthLoginRequest,
  AuthSessionSnapshot,
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

class AuthServiceError extends Error {
  code: AuthErrorPayload['error'] | 'UNKNOWN'
  status: number

  constructor(
    message: string,
    code: AuthErrorPayload['error'] | 'UNKNOWN',
    status: number
  ) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
    this.status = status
  }
}

const parseJsonResponse = async <T>(response: Response) => {
  if (response.ok) {
    return (await response.json()) as T
  }

  let payload: Partial<AuthErrorPayload> | null = null

  try {
    payload = (await response.json()) as Partial<AuthErrorPayload>
  } catch {
    payload = null
  }

  throw new AuthServiceError(
    payload?.message || '登录服务暂时不可用，请稍后再试。',
    payload?.error || 'UNKNOWN',
    response.status
  )
}

export const fetchSession = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
    credentials: 'include',
  })

  return parseJsonResponse<AuthSessionSnapshot>(response)
}

export const loginWithDemoAccount = async (payload: AuthLoginRequest) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseJsonResponse<AuthSessionSnapshot>(response)
}

export const logoutSession = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    let payload: Partial<AuthErrorPayload> | null = null

    try {
      payload = (await response.json()) as Partial<AuthErrorPayload>
    } catch {
      payload = null
    }

    throw new AuthServiceError(
      payload?.message || '退出登录失败，请稍后再试。',
      payload?.error || 'UNKNOWN',
      response.status
    )
  }
}
