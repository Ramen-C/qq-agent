import type {
  ApiRequest,
  ApiResponse,
} from '../_lib/http'
import { handleAuthLogin } from '../_lib/handlers/auth'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  await handleAuthLogin(request, response)
}
