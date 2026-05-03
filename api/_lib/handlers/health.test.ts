import {
  describe,
  expect,
  it,
} from 'vitest'
import { handleHealthCheck } from './health'

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

describe('handleHealthCheck', () => {
  it('returns a JSON health payload for GET requests', async () => {
    const { response, getHeader, getBody } = createResponse()

    await handleHealthCheck(
      {
        method: 'GET',
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(200)
    expect(getHeader('Content-Type')).toContain('application/json')
    expect(JSON.parse(getBody())).toMatchObject({
      ok: true,
      service: 'qq-shrimp-bff',
    })
  })
})
