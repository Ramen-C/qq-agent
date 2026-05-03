import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  handleAuthLogin,
  handleAuthSession,
  handleAuthLogout,
} from './auth'

const createResponse = () => {
  const headers = new Map<string, string>()
  let body = ''

  return {
    response: {
      statusCode: 0,
      setHeader(name: string, value: string) {
        headers.set(name, value)
      },
      end(value?: string) {
        body = value || ''
      },
    },
    getHeader(name: string) {
      return headers.get(name)
    },
    getBody() {
      return body
    },
  }
}

describe('auth handlers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('logs in with the demo account and returns a session cookie', async () => {
    vi.stubEnv('AUTH_COOKIE_SECRET', 'test-secret')
    vi.stubEnv('DEMO_LOGIN_ACCOUNT', 'reviewer01')
    vi.stubEnv('DEMO_LOGIN_PASSWORD', 'qq-demo-2026')
    vi.stubEnv('DEMO_LOGIN_QQ', '240001')
    vi.stubEnv('DEMO_LOGIN_NAME', '星火社团体验号')
    const { response, getHeader, getBody } = createResponse()

    await handleAuthLogin(
      {
        method: 'POST',
        body: JSON.stringify({
          account: 'reviewer01',
          password: 'qq-demo-2026',
        }),
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(200)
    expect(getHeader('Set-Cookie')).toContain('qq_demo_session=')
    expect(JSON.parse(getBody())).toMatchObject({
      authenticated: true,
      user: {
        displayName: '星火社团体验号',
      },
    })
  })

  it('returns anonymous session snapshot when no cookie is present', async () => {
    const { response, getBody } = createResponse()

    await handleAuthSession(
      {
        method: 'GET',
        headers: {},
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(getBody())).toEqual({
      authenticated: false,
      user: null,
    })
  })

  it('clears the session cookie on logout', async () => {
    const { response, getHeader } = createResponse()

    await handleAuthLogout(
      {
        method: 'POST',
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(204)
    expect(getHeader('Set-Cookie')).toContain('Max-Age=0')
  })
})
