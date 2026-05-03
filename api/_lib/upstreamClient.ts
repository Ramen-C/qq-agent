const withTrailingSlashTrimmed = (value: string) => value.replace(/\/$/, '')

export const postToUpstream = async <T>(
  path: string,
  payload: unknown
) => {
  const baseUrl = process.env.UPSTREAM_API_BASE_URL

  if (!baseUrl) {
    return null
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const targetUrl = `${withTrailingSlashTrimmed(baseUrl)}${normalizedPath}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.UPSTREAM_API_TOKEN
          ? {
              Authorization: `Bearer ${process.env.UPSTREAM_API_TOKEN}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Upstream request failed with status ${response.status}`)
    }

    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}
