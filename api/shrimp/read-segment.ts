import type {
  ApiRequest,
  ApiResponse,
} from '../_lib/http'
import { handleShrimpReadSegment } from '../_lib/handlers/shrimp'

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  await handleShrimpReadSegment(request, response)
}
