import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http'

export type ApiRequest = IncomingMessage & {
  body?: unknown
}

export type ApiResponse = ServerResponse<IncomingMessage>

export const getRequestPath = (request: Pick<IncomingMessage, 'url'>) =>
  new URL(request.url || '/', 'http://localhost').pathname

const normalizeBody = <T>(body: unknown) => {
  if (typeof body === 'string') {
    return (body ? JSON.parse(body) : {}) as T
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8')) as T
  }

  return (body || {}) as T
}

export const readJsonBody = async <T>(request: ApiRequest) => {
  if (typeof request.body !== 'undefined') {
    return normalizeBody<T>(request.body)
  }

  const chunks: Uint8Array[] = []

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? (JSON.parse(rawBody) as T) : ({} as T)
}

export const sendJson = (
  response: ApiResponse,
  statusCode: number,
  payload: unknown
) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export const sendNoContent = (
  response: ApiResponse,
  statusCode = 204
) => {
  response.statusCode = statusCode
  response.end()
}
