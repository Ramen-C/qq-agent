import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { handleShrimpReadSegment } from './shrimp'

const createResponse = () => {
  const headers = new Map<string, string>()
  let body = ''

  return {
    response: {
      statusCode: 0,
      setHeader(name: string, value: string) {
        headers.set(name, value)
      },
      end(value?: string) {
        body = value || ''
      },
    },
    getHeader(name: string) {
      return headers.get(name)
    },
    getBody() {
      return body
    },
  }
}

const repeatedPayload = {
  conversationTitle: '星火创想社',
  messages: [
    { id: '1', senderName: '成员甲', lines: ['夜训开麦吗'], quoteLines: [] },
    { id: '2', senderName: '成员乙', lines: ['我也觉得夜训开麦可以'], quoteLines: [] },
    { id: '3', senderName: '成员丙', lines: ['那就按夜训开麦准备'], quoteLines: [] },
  ],
  dictionarySummary: [],
  growthState: {
    level: 1,
    levelLabel: 'Lv.1 记忆起步',
    memoryValue: 18,
    tacitValue: 11,
    unlockedAbilities: ['群体表达识别'],
  },
}

describe('handleShrimpReadSegment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('relays successful upstream responses', async () => {
    vi.stubEnv('UPSTREAM_API_BASE_URL', 'https://relay.example.com')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          shouldStore: true,
          entryTitle: '夜训开麦',
          entrySummary: '上游返回',
          evidenceSnippet: '夜训开麦吗',
          hintText: '已写入群词典',
          growthDelta: { memoryDelta: 8, tacitDelta: 5 },
        }),
      })
    )

    const { response, getBody } = createResponse()

    await handleShrimpReadSegment(
      {
        method: 'POST',
        body: JSON.stringify(repeatedPayload),
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(getBody())).toMatchObject({
      shouldStore: true,
      entryTitle: '夜训开麦',
    })
  })

  it('returns an explicit upstream error when upstream is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubEnv('UPSTREAM_API_BASE_URL', 'https://relay.example.com')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('upstream unavailable'))
    )

    const { response, getBody } = createResponse()

    await handleShrimpReadSegment(
      {
        method: 'POST',
        body: JSON.stringify(repeatedPayload),
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(502)
    expect(JSON.parse(getBody())).toMatchObject({
      error: 'Shrimp upstream unavailable.',
    })
  })

  it('returns an explicit upstream error when upstream is not configured', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { response, getBody } = createResponse()

    await handleShrimpReadSegment(
      {
        method: 'POST',
        body: JSON.stringify(repeatedPayload),
      } as never,
      response as never
    )

    expect(response.statusCode).toBe(502)
    expect(JSON.parse(getBody())).toMatchObject({
      error: 'Shrimp upstream unavailable.',
    })
  })
})
