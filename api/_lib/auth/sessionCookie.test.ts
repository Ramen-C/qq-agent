import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  clearSessionCookie,
  createSessionCookie,
  readSessionUserId,
} from './sessionCookie'

describe('sessionCookie helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a cookie value that can be read back into a user id', () => {
    vi.stubEnv('AUTH_COOKIE_SECRET', 'test-secret')
    const cookie = createSessionCookie('demo001')
    const sessionUserId = readSessionUserId(cookie)

    expect(sessionUserId).toBe('demo001')
  })

  it('returns a clearing cookie with zero max-age', () => {
    expect(clearSessionCookie()).toContain('Max-Age=0')
  })
})
