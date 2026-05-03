import type {
  ApiRequest,
  ApiResponse,
} from '../_lib/http'
import { handleAuthSession } from '../_lib/handlers/auth'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  await handleAuthSession(request, response)
}
