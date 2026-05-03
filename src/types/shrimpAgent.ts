export type ShrimpPanelView = 'details' | 'dictionary'

export interface ShrimpGrowthState {
  level: number
  levelLabel: string
  memoryValue: number
  tacitValue: number
  personaTitle: string
  personaDescription: string
  unlockedAbilities: string[]
}

export interface ShrimpDictionaryEntry {
  id: string
  title: string
  summary: string
  evidenceSnippet: string
  storedAtLabel: string
}

export interface ShrimpReadMessage {
  id: string
  senderName: string
  lines: string[]
  quoteLines?: string[]
}

export interface ShrimpReadCandidate {
  id: string
  conversationId: string
  conversationTitle: string
  segmentLabel: string
  repeatedExpression: string
  messageCount: number
  distinctSenderCount: number
  messages: ShrimpReadMessage[]
}

export interface ShrimpGrowthDelta {
  memoryDelta: number
  tacitDelta: number
}

export interface ShrimpReadSegmentRequest {
  conversationTitle: string
  messages: ShrimpReadMessage[]
  dictionarySummary: Pick<ShrimpDictionaryEntry, 'title' | 'summary'>[]
  growthState: Pick<
    ShrimpGrowthState,
    'level' | 'levelLabel' | 'memoryValue' | 'tacitValue' | 'unlockedAbilities'
  >
}

export interface ShrimpReadSegmentResponse {
  shouldStore: boolean
  entryTitle: string
  entrySummary: string
  evidenceSnippet: string
  hintText: string
  growthDelta: ShrimpGrowthDelta
}
