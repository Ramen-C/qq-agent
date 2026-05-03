import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE_NAME = 'qq_demo_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

const getCookieSecret = () => {
  const secret = process.env.AUTH_COOKIE_SECRET
  if (!secret) {
    throw new Error('AUTH_COOKIE_SECRET environment variable is required')
  }
  return secret
}

const signPayload = (payload: string) =>
  createHmac('sha256', getCookieSecret())
    .update(payload)
    .digest('base64url')

const serializeCookie = (
  name: string,
  value: string,
  {
    maxAge,
    expires,
  }: {
    maxAge?: number
    expires?: Date
  } = {}
) => {
  const segments = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]

  if (process.env.NODE_ENV === 'production') {
    segments.push('Secure')
  }

  if (typeof maxAge === 'number') {
    segments.push(`Max-Age=${maxAge}`)
  }

  if (expires) {
    segments.push(`Expires=${expires.toUTCString()}`)
  }

  return segments.join('; ')
}

const readCookieValue = (cookieHeader: string | undefined, cookieName: string) => {
  if (!cookieHeader) {
    return ''
  }

  const parts = cookieHeader.split(';')

  for (const part of parts) {
    const [name, ...valueParts] = part.trim().split('=')
    if (name === cookieName) {
      return valueParts.join('=')
    }
  }

  return ''
}

export const createSessionCookie = (userId: string) => {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      issuedAt: Date.now(),
    }),
    'utf8'
  ).toString('base64url')
  const signature = signPayload(payload)
  const value = `${payload}.${signature}`

  return serializeCookie(SESSION_COOKIE_NAME, value, {
    maxAge: SESSION_TTL_SECONDS,
  })
}

export const readSessionUserId = (cookieHeader: string | undefined) => {
  const cookieValue = readCookieValue(cookieHeader, SESSION_COOKIE_NAME)

  if (!cookieValue) {
    return null
  }

  const [payload, signature] = cookieValue.split('.')

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = signPayload(payload)
  const actual = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as { userId?: string }

    return decoded.userId || null
  } catch {
    return null
  }
}

export const clearSessionCookie = () =>
  serializeCookie(SESSION_COOKIE_NAME, '', {
    maxAge: 0,
    expires: new Date(0),
  })
