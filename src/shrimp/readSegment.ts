import type {
  ShrimpReadMessage,
} from '../types/shrimpAgent'

const STOP_PHRASES = new Set([
  '大家',
  '我们',
  '你们',
  '真的',
  '这个',
  '那个',
  '一下',
  '今天',
  '刚刚',
  '就是',
  '有点',
  '然后',
  '一下子',
  '这句',
  '可以',
  '不是',
])

const MIN_PHRASE_LENGTH = 3
const MAX_PHRASE_LENGTH = 8

const normalizeText = (value: string) =>
  value.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '').toLowerCase()

const getMessageTexts = (message: ShrimpReadMessage) => [
  ...message.lines,
  ...(message.quoteLines || []),
]

const collectPhraseCandidates = (text: string) => {
  const normalized = normalizeText(text)
  const phrases = new Set<string>()

  if (normalized.length < MIN_PHRASE_LENGTH) {
    return phrases
  }

  for (let length = MIN_PHRASE_LENGTH; length <= MAX_PHRASE_LENGTH; length += 1) {
    for (let index = 0; index <= normalized.length - length; index += 1) {
      const phrase = normalized.slice(index, index + length)
      if (STOP_PHRASES.has(phrase)) {
        continue
      }

      phrases.add(phrase)
    }
  }

  return phrases
}

export const countDistinctSenders = (messages: ShrimpReadMessage[]) =>
  new Set(messages.map((message) => message.senderName)).size

export const findRepeatedExpression = (messages: ShrimpReadMessage[]) => {
  const phraseToMessageIds = new Map<string, Set<string>>()

  messages.forEach((message) => {
    const seenInMessage = new Set<string>()

    getMessageTexts(message).forEach((text) => {
      collectPhraseCandidates(text).forEach((phrase) => {
        if (seenInMessage.has(phrase)) {
          return
        }

        seenInMessage.add(phrase)
        const ids = phraseToMessageIds.get(phrase) || new Set<string>()
        ids.add(message.id)
        phraseToMessageIds.set(phrase, ids)
      })
    })
  })

  const ranked = [...phraseToMessageIds.entries()]
    .filter(([, ids]) => ids.size >= 2)
    .sort((left, right) => {
      const byMentions = right[1].size - left[1].size
      if (byMentions !== 0) {
        return byMentions
      }

      return right[0].length - left[0].length
    })

  return ranked[0]?.[0] || ''
}

export const hasRepeatedSignal = (messages: ShrimpReadMessage[]) =>
  countDistinctSenders(messages) >= 2 && Boolean(findRepeatedExpression(messages))
