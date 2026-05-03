import type { Plugin } from 'vite'
import type {
  ApiRequest,
  ApiResponse,
} from './http'
import {
  getRequestPath,
  sendJson,
} from './http'
import {
  handleAuthLogin,
  handleAuthLogout,
  handleAuthSession,
} from './handlers/auth'
import { handleHealthCheck } from './handlers/health'
import { handleShrimpReadSegment } from './handlers/shrimp'

type ApiHandler = (
  request: ApiRequest,
  response: ApiResponse
) => Promise<void>

const handlers = new Map<string, ApiHandler>([
  ['/api/health', handleHealthCheck],
  ['/api/auth/login', handleAuthLogin],
  ['/api/auth/session', handleAuthSession],
  ['/api/auth/logout', handleAuthLogout],
  ['/api/shrimp/read-segment', handleShrimpReadSegment],
])

const createMiddlewareHandler =
  () =>
  (
    request: ApiRequest,
    response: ApiResponse,
    next: () => void
  ) => {
    const handler = handlers.get(getRequestPath(request))

    if (!handler) {
      next()
      return
    }

    void handler(request, response).catch((error) => {
      console.error('Vite API middleware failed.', error)
      sendJson(response, 500, {
        error: 'Internal Server Error',
      })
    })
  }

export const createViteApiPlugin = (): Plugin => ({
  name: 'local-api',
  configureServer(server) {
    server.middlewares.use(createMiddlewareHandler())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createMiddlewareHandler())
  },
})
