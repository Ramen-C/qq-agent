export type QQAvatarImageKey =
  | 'avatar-1'
  | 'avatar-2'
  | 'avatar-3'
  | 'avatar-4'

export interface QQIconSpec {
  name: string
  size?: number
  chevron?: boolean
}

export interface QQAvatar {
  kind: 'image' | 'group' | 'placeholder'
  imageKey?: QQAvatarImageKey
  imageKeys?: QQAvatarImageKey[]
  label?: string
  background?: string
  color?: string
}

export interface QQSidebarItem {
  key: string
  icon: QQIconSpec
  active?: boolean
  badge?: string
  dot?: boolean
}

export interface QQCurrentUser {
  name: string
  avatar: QQAvatar
  online: boolean
}

export interface QQConversationSummary {
  id: string
  title: string
  preview: string
  previewPrefix?: string
  previewPrefixTone?: 'danger' | 'warning' | 'muted'
  timeLabel: string
  muted?: boolean
  avatar: QQAvatar
}

export interface QQTimeDivider {
  type: 'time-divider'
  id: string
  label: string
}

export interface QQQuoteBlock {
  speaker: string
  lines: string[]
}

export interface QQMessageItem {
  type: 'message'
  id: string
  direction: 'incoming' | 'outgoing'
  senderName: string
  senderLevel?: string
  avatar: QQAvatar
  lines: string[]
  quote?: QQQuoteBlock
}

export interface QQTimelineHintAction {
  key: 'approve' | 'dismiss'
  label: string
}

export interface QQReadRequestHintItem {
  type: 'hint'
  id: string
  hintType: 'read-request'
  text: string
  candidateId: string
  status: 'pending' | 'approved'
  actions: QQTimelineHintAction[]
}

export interface QQInsightHintItem {
  type: 'hint'
  id: string
  hintType: 'insight'
  text: string
  accentText?: string
}

export type QQTimelineHintItem = QQReadRequestHintItem | QQInsightHintItem

export type QQTimelineItem =
  | QQTimeDivider
  | QQMessageItem
  | QQTimelineHintItem

export interface QQGroupNotice {
  title: string
  body: string
}

export interface QQGroupMember {
  id: string
  name: string
  avatar: QQAvatar
  roleLabel?: string
}

export interface QQConversationDetail {
  id: string
  title: string
  memberCount: number
  headerActions: QQIconSpec[]
  timeline: QQTimelineItem[]
  composerActions: QQIconSpec[]
  notice: QQGroupNotice
  members: QQGroupMember[]
}

export interface QQShellSeed {
  brand: string
  primarySidebarItems: QQSidebarItem[]
  secondarySidebarItems: QQSidebarItem[]
  searchPlaceholder: string
  addActionIcon: QQIconSpec
  defaultConversationId: string
  conversations: QQConversationSummary[]
  conversationDetails: Record<string, QQConversationDetail>
}
