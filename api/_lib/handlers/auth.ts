import type {
  AuthLoginRequest,
  AuthSessionSnapshot,
} from '../../../src/types/auth'
import type {
  ApiRequest,
  ApiResponse,
} from '../http'
import {
  readJsonBody,
  sendJson,
  sendNoContent,
} from '../http'
import {
  clearSessionCookie,
  createSessionCookie,
  readSessionUserId,
} from '../auth/sessionCookie'
import {
  findDemoUserByAccount,
  findDemoUserById,
  sanitizeDemoUser,
} from '../auth/demoUsers'

const METHOD_NOT_ALLOWED = {
  error: 'INVALID_REQUEST',
  message: 'Method Not Allowed',
}

const buildAnonymousSnapshot = (): AuthSessionSnapshot => ({
  authenticated: false,
  user: null,
})

export const handleAuthLogin = async (
  request: ApiRequest,
  response: ApiResponse
) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, METHOD_NOT_ALLOWED)
    return
  }

  const body = await readJsonBody<AuthLoginRequest>(request)
  const account = body.account?.trim()
  const password = body.password || ''

  if (!account || !password) {
    sendJson(response, 400, {
      error: 'INVALID_REQUEST',
      message: '请输入体验账号和密码。',
    })
    return
  }

  const user = findDemoUserByAccount(account)

  if (!user || user.password !== password) {
    sendJson(response, 401, {
      error: 'INVALID_CREDENTIALS',
      message: '账号或密码错误，请核对说明文档中的体验账号。',
    })
    return
  }

  response.setHeader('Set-Cookie', createSessionCookie(user.userId))
  sendJson(response, 200, {
    authenticated: true,
    user: sanitizeDemoUser(user),
  } satisfies AuthSessionSnapshot)
}

export const handleAuthSession = async (
  request: ApiRequest,
  response: ApiResponse
) => {
  if (request.method !== 'GET') {
    sendJson(response, 405, METHOD_NOT_ALLOWED)
    return
  }

  const userId = readSessionUserId(request.headers.cookie)

  if (!userId) {
    sendJson(response, 200, buildAnonymousSnapshot())
    return
  }

  const user = findDemoUserById(userId)

  if (!user) {
    response.setHeader('Set-Cookie', clearSessionCookie())
    sendJson(response, 200, buildAnonymousSnapshot())
    return
  }

  sendJson(response, 200, {
    authenticated: true,
    user: sanitizeDemoUser(user),
  } satisfies AuthSessionSnapshot)
}

export const handleAuthLogout = async (
  request: ApiRequest,
  response: ApiResponse
) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, METHOD_NOT_ALLOWED)
    return
  }

  response.setHeader('Set-Cookie', clearSessionCookie())
  sendNoContent(response)
}
