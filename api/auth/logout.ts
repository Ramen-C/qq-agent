import type {
  ApiRequest,
  ApiResponse,
} from '../_lib/http'
import { handleAuthLogout } from '../_lib/handlers/auth'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  await handleAuthLogout(request, response)
}
