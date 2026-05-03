import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import qq9ShellSeed from '@/fixtures/qq9Shell'
import type {
  QQConversationDetail,
  QQConversationSummary,
  QQCurrentUser,
  QQMessageItem,
  QQShellSeed,
  QQTimeDivider,
  QQTimelineItem,
} from '@/types/qq9Shell'

let messageSeed = 1

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}-${messageSeed++}`

const formatTimeLabel = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

const cloneSeed = (): QQShellSeed => structuredClone(qq9ShellSeed)

const getLastDividerLabel = (timeline: QQTimelineItem[]) => {
  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    const item = timeline[index]
    if (item.type === 'time-divider') {
      return item.label
    }
  }
  return ''
}

const getPreviewText = (draft: string) => draft.split('\n').find(Boolean)?.trim() || '新消息'

export const useQq9ShellStore = defineStore('qq9-shell', () => {
  const seed = ref<QQShellSeed | null>(null)
  const conversations = ref<QQConversationSummary[]>([])
  const conversationDetails = ref<Record<string, QQConversationDetail>>({})
  const currentConversationId = ref('')
  const conversationQuery = ref('')
  const isInfoPanelOpen = ref(true)
  const isMemberSearchOpen = ref(false)
  const memberQuery = ref('')
  const drafts = ref<Record<string, string>>({})
  const isReady = ref(false)

  const bootstrap = () => {
    if (isReady.value) {
      return
    }

    const clonedSeed = cloneSeed()
    seed.value = clonedSeed
    conversations.value = clonedSeed.conversations
    conversationDetails.value = clonedSeed.conversationDetails
    currentConversationId.value = clonedSeed.defaultConversationId
    isInfoPanelOpen.value = true
    isMemberSearchOpen.value = false
    conversationQuery.value = ''
    memberQuery.value = ''
    drafts.value = {}
    isReady.value = true
  }

  const reset = () => {
    seed.value = null
    conversations.value = []
    conversationDetails.value = {}
    currentConversationId.value = ''
    conversationQuery.value = ''
    isInfoPanelOpen.value = true
    isMemberSearchOpen.value = false
    memberQuery.value = ''
    drafts.value = {}
    isReady.value = false
  }

  const filteredConversations = computed(() => {
    const keyword = conversationQuery.value.trim().toLowerCase()
    if (!keyword) {
      return conversations.value
    }

    return conversations.value.filter((conversation) => {
      const haystack = [
        conversation.title,
        conversation.previewPrefix || '',
        conversation.preview,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  })

  const activeConversationId = computed(() => {
    if (filteredConversations.value.length === 0) {
      return ''
    }

    if (
      currentConversationId.value &&
      filteredConversations.value.some(
        (conversation) => conversation.id === currentConversationId.value
      )
    ) {
      return currentConversationId.value
    }

    return filteredConversations.value[0].id
  })

  const currentConversation = computed(() =>
    activeConversationId.value
      ? conversationDetails.value[activeConversationId.value] || null
      : null
  )

  const currentDraft = computed(
    () => drafts.value[activeConversationId.value] || ''
  )

  const filteredMembers = computed(() => {
    const members = currentConversation.value?.members || []
    const keyword = memberQuery.value.trim().toLowerCase()

    if (!keyword) {
      return members
    }

    return members.filter((member) => {
      const haystack = `${member.name} ${member.roleLabel || ''}`.toLowerCase()
      return haystack.includes(keyword)
    })
  })

  const syncSelectionToFilter = () => {
    if (filteredConversations.value.length === 0) {
      isMemberSearchOpen.value = false
      memberQuery.value = ''
      return
    }

    if (
      !filteredConversations.value.some(
        (conversation) => conversation.id === currentConversationId.value
      )
    ) {
      currentConversationId.value = filteredConversations.value[0].id
      isMemberSearchOpen.value = false
      memberQuery.value = ''
    }
  }

  const selectConversation = (id: string) => {
    if (!conversationDetails.value[id]) {
      return
    }

    currentConversationId.value = id
    isMemberSearchOpen.value = false
    memberQuery.value = ''
  }

  const setConversationQuery = (query: string) => {
    conversationQuery.value = query
    syncSelectionToFilter()
  }

  const toggleMemberSearch = (force?: boolean) => {
    const nextValue =
      typeof force === 'boolean' ? force : !isMemberSearchOpen.value

    isMemberSearchOpen.value = nextValue

    if (!nextValue) {
      memberQuery.value = ''
    }
  }

  const setMemberQuery = (query: string) => {
    memberQuery.value = query
  }

  const toggleInfoPanel = (force?: boolean) => {
    const nextValue = typeof force === 'boolean' ? force : !isInfoPanelOpen.value

    isInfoPanelOpen.value = nextValue

    if (!nextValue) {
      isMemberSearchOpen.value = false
      memberQuery.value = ''
    }
  }

  const setDraft = (value: string) => {
    if (!activeConversationId.value) {
      return
    }

    drafts.value = {
      ...drafts.value,
      [activeConversationId.value]: value,
    }
  }

  const updateConversationDetail = (
    conversationId: string,
    updater: (detail: QQConversationDetail) => QQConversationDetail
  ) => {
    const detail = conversationDetails.value[conversationId]

    if (!detail) {
      return null
    }

    const nextDetail = updater(detail)
    conversationDetails.value = {
      ...conversationDetails.value,
      [conversationId]: nextDetail,
    }

    return nextDetail
  }

  const appendTimelineItem = (conversationId: string, item: QQTimelineItem) => {
    updateConversationDetail(conversationId, (detail) => ({
      ...detail,
      timeline: [...detail.timeline, item],
    }))
  }

  const removeTimelineItem = (conversationId: string, itemId: string) => {
    updateConversationDetail(conversationId, (detail) => ({
      ...detail,
      timeline: detail.timeline.filter((item) => item.id !== itemId),
    }))
  }

  const updateTimelineItem = (
    conversationId: string,
    itemId: string,
    updater: (item: QQTimelineItem) => QQTimelineItem
  ) => {
    updateConversationDetail(conversationId, (detail) => ({
      ...detail,
      timeline: detail.timeline.map((item) =>
        item.id === itemId ? updater(item) : item
      ),
    }))
  }

  const sendDraft = (currentUser: QQCurrentUser) => {
    if (!activeConversationId.value) {
      return false
    }

    const conversationId = activeConversationId.value
    const draft = drafts.value[conversationId] || ''
    const normalizedDraft = draft.replace(/\r\n/g, '\n').trim()

    if (!normalizedDraft) {
      return false
    }

    const detail = conversationDetails.value[conversationId]
    if (!detail) {
      return false
    }

    const timestampLabel = formatTimeLabel(new Date())
    const nextTimeline = detail.timeline.slice()
    const lastDividerLabel = getLastDividerLabel(nextTimeline)

    if (lastDividerLabel !== timestampLabel) {
      const divider: QQTimeDivider = {
        type: 'time-divider',
        id: createMessageId('time'),
        label: timestampLabel,
      }
      nextTimeline.push(divider)
    }

    const outgoingMessage: QQMessageItem = {
      type: 'message',
      id: createMessageId('message'),
      direction: 'outgoing',
      senderName: currentUser.name,
      avatar: currentUser.avatar,
      lines: normalizedDraft.split('\n'),
    }

    nextTimeline.push(outgoingMessage)

    updateConversationDetail(conversationId, () => ({
      ...detail,
      timeline: nextTimeline,
    }))

    conversations.value = conversations.value.map((conversation) =>
      conversation.id === conversationId
        ? {
            ...conversation,
            preview: getPreviewText(normalizedDraft),
            previewPrefix: undefined,
            previewPrefixTone: undefined,
            timeLabel: timestampLabel,
          }
        : conversation
    )

    drafts.value = {
      ...drafts.value,
      [conversationId]: '',
    }

    return true
  }

  return {
    seed,
    conversations,
    conversationQuery,
    isInfoPanelOpen,
    isMemberSearchOpen,
    memberQuery,
    isReady,
    activeConversationId,
    filteredConversations,
    currentConversation,
    currentDraft,
    filteredMembers,
    bootstrap,
    reset,
    selectConversation,
    setConversationQuery,
    toggleMemberSearch,
    setMemberQuery,
    toggleInfoPanel,
    setDraft,
    appendTimelineItem,
    removeTimelineItem,
    updateTimelineItem,
    sendDraft,
  }
})
