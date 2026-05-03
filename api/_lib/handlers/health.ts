import type {
  ApiRequest,
  ApiResponse,
} from '../http'
import { sendJson } from '../http'

export const handleHealthCheck = async (
  request: ApiRequest,
  response: ApiResponse
) => {
  if (request.method !== 'GET') {
    sendJson(response, 405, {
      error: 'INVALID_REQUEST',
      message: 'Method Not Allowed',
    })
    return
  }

  sendJson(response, 200, {
    ok: true,
    service: 'qq-shrimp-bff',
    time: new Date().toISOString(),
  })
}
