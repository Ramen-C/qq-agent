import type {
  ShrimpReadSegmentRequest,
  ShrimpReadSegmentResponse,
} from '../../../src/types/shrimpAgent'
import type {
  ApiRequest,
  ApiResponse,
} from '../http'
import {
  readJsonBody,
  sendJson,
} from '../http'
import { postToUpstream } from '../upstreamClient'

const SHRIMP_UPSTREAM_PATH =
  process.env.UPSTREAM_SHRIMP_PATH || '/api/shrimp/read-segment'

const analyzeWithModel = async (
  request: ShrimpReadSegmentRequest
): Promise<ShrimpReadSegmentResponse> => {
  const upstreamResult = await postToUpstream<ShrimpReadSegmentResponse>(
    SHRIMP_UPSTREAM_PATH,
    request
  )

  if (!upstreamResult) {
    throw new Error('Shrimp upstream is not configured.')
  }

  return upstreamResult
}

export const handleShrimpReadSegment = async (
  request: ApiRequest,
  response: ApiResponse
) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method Not Allowed' })
    return
  }

  try {
    const body = await readJsonBody<ShrimpReadSegmentRequest>(request)
    const result = await analyzeWithModel(body)
    sendJson(response, 200, result)
  } catch (error) {
    console.error('Shrimp API failed.', error)
    sendJson(response, 502, {
      error: 'Shrimp upstream unavailable.',
    })
  }
}
