import type {
  ApiRequest,
  ApiResponse,
} from './_lib/http'
import { handleHealthCheck } from './_lib/handlers/health'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  await handleHealthCheck(request, response)
}
