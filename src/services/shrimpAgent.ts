import type {
  ShrimpReadSegmentRequest,
  ShrimpReadSegmentResponse,
} from '@/types/shrimpAgent'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const readSegmentWithShrimp = async (
  request: ShrimpReadSegmentRequest
) => {
  const response = await fetch(`${API_BASE_URL}/api/shrimp/read-segment`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Shrimp API failed with status ${response.status}`)
  }

  return (await response.json()) as ShrimpReadSegmentResponse
}
