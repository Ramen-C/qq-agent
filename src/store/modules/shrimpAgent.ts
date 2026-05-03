import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { findRepeatedExpression } from '@/shrimp/readSegment'
import { readSegmentWithShrimp } from '@/services/shrimpAgent'
import { useQq9ShellStore } from '@/store/modules/qq9Shell'
import type {
  QQMessageItem,
  QQReadRequestHintItem,
  QQTimelineItem,
} from '@/types/qq9Shell'
import type {
  ShrimpDictionaryEntry,
  ShrimpGrowthState,
  ShrimpPanelView,
  ShrimpReadCandidate,
  ShrimpReadMessage,
  ShrimpReadSegmentResponse,
} from '@/types/shrimpAgent'

let shrimpSeed = 1

const createShrimpId = (prefix: string) =>
  `${prefix}-${Date.now()}-${shrimpSeed++}`

const createInitialGrowthState = (): ShrimpGrowthState => ({
  level: 1,
  levelLabel: 'Lv.1 记忆起步',
  memoryValue: 18,
  tacitValue: 11,
  personaTitle: '轻角色助手',
  personaDescription:
    '小虾会先申请，再查看刚刚那一段公开群聊，专门帮群里记住反复出现的共同表达。',
  unlockedAbilities: ['群体表达识别', '基础群词典沉淀', '轻提示播报'],
})

const isMessageItem = (item: QQTimelineItem): item is QQMessageItem =>
  item.type === 'message'

const toReadMessage = (item: QQMessageItem): ShrimpReadMessage => ({
  id: item.id,
  senderName: item.senderName,
  lines: item.lines,
  quoteLines: item.quote?.lines,
})

const buildReadRequestHint = (candidateId: string): QQReadRequestHintItem => ({
  type: 'hint',
  id: `shrimp-request-${candidateId}`,
  hintType: 'read-request',
  text: '小虾觉得刚刚这段聊天里可能有值得记住的表达，申请查看这段公开群聊内容。',
  candidateId,
  status: 'pending',
  actions: [
    { key: 'approve', label: '允许查看' },
    { key: 'dismiss', label: '暂不查看' },
  ],
})

const getLatestSegment = (timeline: QQTimelineItem[]) => {
  let lastDividerIndex = -1

  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    if (timeline[index].type === 'time-divider') {
      lastDividerIndex = index
      break
    }
  }

  const dividerItem = lastDividerIndex >= 0 ? timeline[lastDividerIndex] : null
  const divider = dividerItem?.type === 'time-divider' ? dividerItem : null

  const messages = timeline
    .slice(lastDividerIndex + 1)
    .filter(isMessageItem)
    .filter((item) => item.direction === 'incoming')

  return {
    dividerId: divider?.id || 'segment-start',
    segmentLabel: divider?.label || '刚刚',
    messages,
  }
}

const buildReadCandidate = (
  conversationId: string,
  conversationTitle: string,
  timeline: QQTimelineItem[]
): ShrimpReadCandidate | null => {
  const segment = getLatestSegment(timeline)

  if (segment.messages.length < 3) {
    return null
  }

  const readMessages = segment.messages.map(toReadMessage)
  const distinctSenderCount = new Set(
    readMessages.map((message) => message.senderName)
  ).size

  if (distinctSenderCount < 2) {
    return null
  }

  const repeatedExpression = findRepeatedExpression(readMessages)

  if (!repeatedExpression) {
    return null
  }

  return {
    id: `${conversationId}:${segment.dividerId}:${segment.messages
      .map((message) => message.id)
      .join('-')}`,
    conversationId,
    conversationTitle,
    segmentLabel: segment.segmentLabel,
    repeatedExpression,
    messageCount: readMessages.length,
    distinctSenderCount,
    messages: readMessages,
  }
}

export const useShrimpAgentStore = defineStore('shrimp-agent', () => {
  const shellStore = useQq9ShellStore()

  const isReady = ref(false)
  const isMenuOpen = ref(false)
  const activePanelView = ref<ShrimpPanelView | null>(null)
  const analyzingCandidateId = ref('')
  const growthByConversation = ref<Record<string, ShrimpGrowthState>>({})
  const dictionaryByConversation = ref<Record<string, ShrimpDictionaryEntry[]>>({})
  const candidatesById = ref<Record<string, ShrimpReadCandidate>>({})
  const requestedCandidateIds = ref<Record<string, true>>({})
  const dismissedCandidateIds = ref<Record<string, true>>({})
  const analyzedCandidateIds = ref<Record<string, true>>({})

  let requestTimer: ReturnType<typeof setTimeout> | null = null

  const currentConversationId = computed(() => shellStore.activeConversationId)

  const currentGrowthState = computed(
    () =>
      growthByConversation.value[currentConversationId.value] ||
      createInitialGrowthState()
  )

  const currentDictionaryEntries = computed(
    () => dictionaryByConversation.value[currentConversationId.value] || []
  )

  const bootstrap = () => {
    if (isReady.value || !shellStore.seed) {
      return
    }

    const nextGrowth: Record<string, ShrimpGrowthState> = {}
    const nextDictionary: Record<string, ShrimpDictionaryEntry[]> = {}

    shellStore.seed.conversations.forEach((conversation) => {
      nextGrowth[conversation.id] = createInitialGrowthState()
      nextDictionary[conversation.id] = []
    })

    growthByConversation.value = nextGrowth
    dictionaryByConversation.value = nextDictionary
    isReady.value = true
  }

  const reset = () => {
    if (requestTimer) {
      clearTimeout(requestTimer)
      requestTimer = null
    }

    isReady.value = false
    isMenuOpen.value = false
    activePanelView.value = null
    analyzingCandidateId.value = ''
    growthByConversation.value = {}
    dictionaryByConversation.value = {}
    candidatesById.value = {}
    requestedCandidateIds.value = {}
    dismissedCandidateIds.value = {}
    analyzedCandidateIds.value = {}
  }

  const closeMenu = () => {
    isMenuOpen.value = false
    activePanelView.value = null
  }

  const toggleMenu = () => {
    if (isMenuOpen.value) {
      closeMenu()
      return
    }

    isMenuOpen.value = true
    activePanelView.value = null
  }

  const openPanel = (view: ShrimpPanelView) => {
    isMenuOpen.value = true
    activePanelView.value = view
  }

  const returnToMenu = () => {
    activePanelView.value = null
  }

  const storeCandidate = (candidate: ShrimpReadCandidate) => {
    candidatesById.value = {
      ...candidatesById.value,
      [candidate.id]: candidate,
    }
  }

  const queueReadRequest = () => {
    if (!isReady.value || !shellStore.currentConversation) {
      return
    }

    const conversation = shellStore.currentConversation
    const candidate = buildReadCandidate(
      conversation.id,
      conversation.title,
      conversation.timeline
    )

    if (!candidate) {
      return
    }

    if (
      requestedCandidateIds.value[candidate.id] ||
      dismissedCandidateIds.value[candidate.id] ||
      analyzedCandidateIds.value[candidate.id]
    ) {
      return
    }

    storeCandidate(candidate)

    if (requestTimer) {
      clearTimeout(requestTimer)
    }

    requestTimer = setTimeout(() => {
      if (shellStore.activeConversationId !== candidate.conversationId) {
        return
      }

      if (
        requestedCandidateIds.value[candidate.id] ||
        dismissedCandidateIds.value[candidate.id] ||
        analyzedCandidateIds.value[candidate.id]
      ) {
        return
      }

      shellStore.appendTimelineItem(
        candidate.conversationId,
        buildReadRequestHint(candidate.id)
      )

      requestedCandidateIds.value = {
        ...requestedCandidateIds.value,
        [candidate.id]: true,
      }
    }, 720)
  }

  const dismissReadRequest = (candidateId: string) => {
    const candidate = candidatesById.value[candidateId]
    if (!candidate) {
      return
    }

    dismissedCandidateIds.value = {
      ...dismissedCandidateIds.value,
      [candidateId]: true,
    }

    shellStore.removeTimelineItem(candidate.conversationId, `shrimp-request-${candidateId}`)
  }

  const approveReadRequest = async (candidateId: string) => {
    const candidate = candidatesById.value[candidateId]
    if (!candidate || analyzingCandidateId.value === candidateId) {
      return
    }

    analyzingCandidateId.value = candidateId

    shellStore.updateTimelineItem(
      candidate.conversationId,
      `shrimp-request-${candidateId}`,
      (item) =>
        item.type === 'hint' && item.hintType === 'read-request'
          ? {
              ...item,
              status: 'approved',
              text: '小虾正在整理刚刚那段公开群聊里的共同表达...',
              actions: [],
            }
          : item
    )

    try {
      const dictionarySummary = (
        dictionaryByConversation.value[candidate.conversationId] || []
      ).map((entry) => ({
        title: entry.title,
        summary: entry.summary,
      }))

      const growthState = growthByConversation.value[candidate.conversationId]

      let result: ShrimpReadSegmentResponse

      try {
        result = await readSegmentWithShrimp({
          conversationTitle: candidate.conversationTitle,
          messages: candidate.messages,
          dictionarySummary,
          growthState: {
            level: growthState.level,
            levelLabel: growthState.levelLabel,
            memoryValue: growthState.memoryValue,
            tacitValue: growthState.tacitValue,
            unlockedAbilities: growthState.unlockedAbilities,
          },
        })
      } catch (error) {
        console.error('Shrimp upstream analysis failed.', error)
        shellStore.updateTimelineItem(
          candidate.conversationId,
          `shrimp-request-${candidateId}`,
          (item) =>
            item.type === 'hint' && item.hintType === 'read-request'
              ? {
                  ...item,
                  status: 'approved',
                  text: '小虾暂时无法连接腾讯云上游服务，本次未写入群词典。',
                  actions: [],
                }
              : item
        )
        return
      }

      shellStore.removeTimelineItem(
        candidate.conversationId,
        `shrimp-request-${candidateId}`
      )

      analyzedCandidateIds.value = {
        ...analyzedCandidateIds.value,
        [candidateId]: true,
      }

      if (!result.shouldStore) {
        return
      }

      const nextEntry: ShrimpDictionaryEntry = {
        id: createShrimpId('dictionary'),
        title: result.entryTitle,
        summary: result.entrySummary,
        evidenceSnippet: result.evidenceSnippet,
        storedAtLabel: candidate.segmentLabel,
      }

      const existingEntries =
        dictionaryByConversation.value[candidate.conversationId] || []
      const dedupedEntries = existingEntries.filter(
        (entry) => entry.title !== nextEntry.title
      )

      dictionaryByConversation.value = {
        ...dictionaryByConversation.value,
        [candidate.conversationId]: [nextEntry, ...dedupedEntries].slice(0, 6),
      }

      const currentGrowth = growthByConversation.value[candidate.conversationId]
      growthByConversation.value = {
        ...growthByConversation.value,
        [candidate.conversationId]: {
          ...currentGrowth,
          memoryValue: currentGrowth.memoryValue + result.growthDelta.memoryDelta,
          tacitValue: currentGrowth.tacitValue + result.growthDelta.tacitDelta,
        },
      }

      shellStore.appendTimelineItem(candidate.conversationId, {
        type: 'hint',
        id: createShrimpId('insight'),
        hintType: 'insight',
        text: result.hintText,
        accentText: '已同步写入群词典',
      })
    } finally {
      analyzingCandidateId.value = ''
    }
  }

  watch(
    () => [
      shellStore.isReady,
      shellStore.activeConversationId,
      shellStore.currentConversation?.timeline.length || 0,
    ],
    () => {
      if (!shellStore.isReady) {
        return
      }

      bootstrap()
      queueReadRequest()
    },
    { immediate: true }
  )

  watch(
    () => shellStore.activeConversationId,
    () => {
      closeMenu()
    }
  )

  return {
    isReady,
    isMenuOpen,
    activePanelView,
    analyzingCandidateId,
    currentGrowthState,
    currentDictionaryEntries,
    bootstrap,
    reset,
    toggleMenu,
    closeMenu,
    openPanel,
    returnToMenu,
    approveReadRequest,
    dismissReadRequest,
  }
})
