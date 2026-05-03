<script setup lang="ts">
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useShrimpAgentStore } from '@/store/modules/shrimpAgent'
import type {
  QQAvatar,
  QQConversationDetail,
  QQIconSpec,
  QQInsightHintItem,
  QQMessageItem,
  QQReadRequestHintItem,
  QQTimelineHintAction,
  QQTimelineHintItem,
} from '@/types/qq9Shell'
import QQAvatarView from './QQAvatar.vue'
import QQIcon from './QQIcon.vue'

const props = defineProps<{
  conversation: QQConversationDetail | null
  currentUserName: string
  currentUserAvatar: QQAvatar
  draft: string
  panelOpen: boolean
}>()

const emit = defineEmits<{
  toggleInfoPanel: []
  updateDraft: [value: string]
  send: []
}>()

const shrimpStore = useShrimpAgentStore()
const timelineRef = ref<HTMLElement | null>(null)
const shrimpMenuRef = ref<HTMLElement | null>(null)

const isMessageItem = (
  item: QQConversationDetail['timeline'][number]
): item is QQMessageItem => item.type === 'message'

const isHintItem = (
  item: QQConversationDetail['timeline'][number]
): item is QQTimelineHintItem => item.type === 'hint'

const isReadRequestHint = (
  item: QQTimelineHintItem
): item is QQReadRequestHintItem => item.hintType === 'read-request'

const isInsightHint = (
  item: QQTimelineHintItem
): item is QQInsightHintItem => item.hintType === 'insight'

const onHeaderActionClick = (action: QQIconSpec) => {
  if (action.name === 'more') {
    emit('toggleInfoPanel')
  }
}

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('updateDraft', target.value)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('send')
  }
}

const onShrimpHintAction = (
  action: QQTimelineHintAction['key'],
  candidateId: string
) => {
  if (action === 'approve') {
    shrimpStore.approveReadRequest(candidateId)
    return
  }

  shrimpStore.dismissReadRequest(candidateId)
}

const scrollToBottom = () => {
  if (!timelineRef.value) {
    return
  }

  timelineRef.value.scrollTop = timelineRef.value.scrollHeight
}

const onWindowPointerDown = (event: PointerEvent) => {
  if (!shrimpStore.isMenuOpen || !shrimpMenuRef.value) {
    return
  }

  const target = event.target as Node | null

  if (target && shrimpMenuRef.value.contains(target)) {
    return
  }

  shrimpStore.closeMenu()
}

onMounted(() => {
  window.addEventListener('pointerdown', onWindowPointerDown)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown)
})

watch(
  () => props.conversation?.id,
  () => {
    nextTick(scrollToBottom)
  },
  { immediate: true }
)

watch(
  () => props.conversation?.timeline.length,
  () => {
    nextTick(scrollToBottom)
  }
)
</script>

<template>
  <section
    class="qq9-chat-pane"
    :class="{ 'is-panel-open': panelOpen }"
  >
    <template v-if="conversation">
      <header class="qq9-chat-pane__header">
        <h1 class="qq9-chat-pane__title">
          {{ conversation.title }} ({{ conversation.memberCount }})
        </h1>
        <div class="qq9-chat-pane__actions">
          <div
            ref="shrimpMenuRef"
            class="qq9-shrimp-anchor"
          >
            <button
              class="qq9-chat-pane__action qq9-chat-pane__shrimp-trigger"
              :class="{ 'is-active': shrimpStore.isMenuOpen }"
              type="button"
              @click.stop="shrimpStore.toggleMenu"
            >
              <q-q-icon
                name="shrimp"
                :size="24"
                color="#2f86ef"
              />
            </button>

            <div
              v-if="shrimpStore.isMenuOpen"
              class="qq9-shrimp-popover"
            >
              <template v-if="!shrimpStore.activePanelView">
                <button
                  class="qq9-shrimp-popover__menu-item"
                  type="button"
                  @click="shrimpStore.openPanel('details')"
                >
                  <span>小虾详情</span>
                  <q-q-icon
                    name="chevron-right"
                    :size="16"
                    color="#6e7890"
                  />
                </button>
                <button
                  class="qq9-shrimp-popover__menu-item"
                  type="button"
                  @click="shrimpStore.openPanel('dictionary')"
                >
                  <span>群词典</span>
                  <q-q-icon
                    name="chevron-right"
                    :size="16"
                    color="#6e7890"
                  />
                </button>
              </template>

              <template v-else-if="shrimpStore.activePanelView === 'details'">
                <div class="qq9-shrimp-popover__panel">
                  <div class="qq9-shrimp-popover__panel-head">
                    <button
                      class="qq9-shrimp-popover__back"
                      type="button"
                      @click="shrimpStore.returnToMenu"
                    >
                      <q-q-icon
                        name="chevron-right"
                        :size="16"
                        color="#6e7890"
                      />
                      <span>返回</span>
                    </button>
                    <button
                      class="qq9-shrimp-popover__close"
                      type="button"
                      @click="shrimpStore.closeMenu"
                    >
                      收起
                    </button>
                  </div>

                  <div class="qq9-shrimp-card">
                    <div class="qq9-shrimp-card__hero">
                      <div class="qq9-shrimp-card__badge">
                        {{ shrimpStore.currentGrowthState.levelLabel }}
                      </div>
                      <h3>{{ shrimpStore.currentGrowthState.personaTitle }}</h3>
                      <p>{{ shrimpStore.currentGrowthState.personaDescription }}</p>
                    </div>

                    <div class="qq9-shrimp-card__stats">
                      <div class="qq9-shrimp-card__stat">
                        <span>等级</span>
                        <strong>{{ shrimpStore.currentGrowthState.level }}</strong>
                      </div>
                      <div class="qq9-shrimp-card__stat">
                        <span>记忆值</span>
                        <strong>{{ shrimpStore.currentGrowthState.memoryValue }}</strong>
                      </div>
                      <div class="qq9-shrimp-card__stat">
                        <span>群默契值</span>
                        <strong>{{ shrimpStore.currentGrowthState.tacitValue }}</strong>
                      </div>
                    </div>

                    <div class="qq9-shrimp-card__section">
                      <p class="qq9-shrimp-card__label">已解锁能力</p>
                      <div class="qq9-shrimp-card__chips">
                        <span
                          v-for="ability in shrimpStore.currentGrowthState.unlockedAbilities"
                          :key="ability"
                          class="qq9-shrimp-card__chip"
                        >
                          {{ ability }}
                        </span>
                      </div>
                    </div>

                    <div class="qq9-shrimp-card__section">
                      <p class="qq9-shrimp-card__label">安全边界</p>
                      <p class="qq9-shrimp-card__note">
                        小虾不会直接偷看，只会在刚刚那一段公开群聊出现明显群体表达时先发起申请。你同意后，它才会整理这一段内容。
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="qq9-shrimp-popover__panel">
                  <div class="qq9-shrimp-popover__panel-head">
                    <button
                      class="qq9-shrimp-popover__back"
                      type="button"
                      @click="shrimpStore.returnToMenu"
                    >
                      <q-q-icon
                        name="chevron-right"
                        :size="16"
                        color="#6e7890"
                      />
                      <span>返回</span>
                    </button>
                    <button
                      class="qq9-shrimp-popover__close"
                      type="button"
                      @click="shrimpStore.closeMenu"
                    >
                      收起
                    </button>
                  </div>

                  <div class="qq9-shrimp-dictionary">
                    <div
                      v-if="shrimpStore.currentDictionaryEntries.length === 0"
                      class="qq9-shrimp-dictionary__empty"
                    >
                      小虾还没有记下新的群体表达。
                    </div>

                    <article
                      v-for="entry in shrimpStore.currentDictionaryEntries"
                      :key="entry.id"
                      class="qq9-shrimp-entry"
                    >
                      <div class="qq9-shrimp-entry__meta">
                        <h3>{{ entry.title }}</h3>
                        <span>{{ entry.storedAtLabel }}</span>
                      </div>
                      <p class="qq9-shrimp-entry__summary">{{ entry.summary }}</p>
                      <p class="qq9-shrimp-entry__evidence">“{{ entry.evidenceSnippet }}”</p>
                    </article>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <button
            v-for="(action, index) in conversation.headerActions"
            :key="`${action.name}-${index}`"
            class="qq9-chat-pane__action"
            type="button"
            :class="{ 'is-active': action.name === 'more' && panelOpen }"
            @click="onHeaderActionClick(action)"
          >
            <q-q-icon
              :name="action.name"
              :size="action.size || 22"
              color="#20242d"
            />
            <q-q-icon
              v-if="action.chevron"
              name="chevron-down"
              :size="14"
              color="#20242d"
            />
          </button>
        </div>
      </header>

      <div class="qq9-chat-pane__body">
        <div
          ref="timelineRef"
          class="qq9-chat-pane__timeline qq9-scrollbar"
        >
          <template
            v-for="item in conversation.timeline"
            :key="item.id"
          >
            <div
              v-if="item.type === 'time-divider'"
              class="qq9-chat-pane__time"
            >
              {{ item.label }}
            </div>

            <section
              v-else-if="isHintItem(item)"
              class="qq9-shrimp-hint"
              :class="{
                'is-insight': isInsightHint(item),
                'is-approved': isReadRequestHint(item) && item.status === 'approved',
              }"
            >
              <div class="qq9-shrimp-hint__icon">
                <q-q-icon
                  name="shrimp"
                  :size="20"
                  color="#2f86ef"
                />
              </div>

              <div class="qq9-shrimp-hint__body">
                <p class="qq9-shrimp-hint__text">{{ item.text }}</p>

                <p
                  v-if="isInsightHint(item) && item.accentText"
                  class="qq9-shrimp-hint__accent"
                >
                  {{ item.accentText }}
                </p>

                <div
                  v-if="isReadRequestHint(item) && item.status === 'pending'"
                  class="qq9-shrimp-hint__actions"
                >
                  <button
                    v-for="action in item.actions"
                    :key="action.key"
                    class="qq9-shrimp-hint__button"
                    :class="{ 'is-secondary': action.key === 'dismiss' }"
                    type="button"
                    @click="onShrimpHintAction(action.key, item.candidateId)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </section>

            <article
              v-else-if="isMessageItem(item)"
              class="qq9-message"
              :class="{ 'is-outgoing': item.direction === 'outgoing' }"
            >
              <template v-if="item.direction === 'incoming'">
                <q-q-avatar-view
                  :avatar="item.avatar"
                  :size="40"
                  :rounded="20"
                />

                <div class="qq9-message__body">
                  <div class="qq9-message__meta">
                    <span class="qq9-message__sender">{{ item.senderName }}</span>
                    <span
                      v-if="item.senderLevel"
                      class="qq9-message__level"
                    >
                      {{ item.senderLevel }}
                    </span>
                  </div>

                  <div class="qq9-message__bubble">
                    <div
                      v-if="item.quote"
                      class="qq9-quote"
                    >
                      <p class="qq9-quote__speaker">{{ item.quote.speaker }}</p>
                      <p
                        v-for="(line, index) in item.quote.lines"
                        :key="`${item.id}-quote-${index}`"
                        class="qq9-quote__line"
                      >
                        {{ line }}
                      </p>
                    </div>

                    <p
                      v-for="(line, index) in item.lines"
                      :key="`${item.id}-line-${index}`"
                      class="qq9-message__line"
                    >
                      {{ line }}
                    </p>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="qq9-message__body qq9-message__body--outgoing">
                  <div class="qq9-message__meta qq9-message__meta--outgoing">
                    <span class="qq9-message__sender">{{ currentUserName }}</span>
                  </div>

                  <div class="qq9-message__bubble qq9-message__bubble--outgoing">
                    <p
                      v-for="(line, index) in item.lines"
                      :key="`${item.id}-line-${index}`"
                      class="qq9-message__line"
                    >
                      {{ line }}
                    </p>
                  </div>
                </div>

                <q-q-avatar-view
                  :avatar="currentUserAvatar"
                  :size="40"
                  :rounded="20"
                />
              </template>
            </article>
          </template>
        </div>

        <div class="qq9-chat-pane__composer">
          <div class="qq9-chat-pane__composer-tools">
            <button
              v-for="(action, index) in conversation.composerActions"
              :key="`${action.name}-${index}`"
              class="qq9-chat-pane__composer-button"
              type="button"
            >
              <q-q-icon
                :name="action.name"
                :size="action.size || 22"
                color="#1d2230"
              />
              <q-q-icon
                v-if="action.chevron"
                name="chevron-down"
                :size="14"
                color="#1d2230"
              />
            </button>
          </div>

          <textarea
            class="qq9-chat-pane__composer-input"
            :value="draft"
            rows="1"
            @input="onInput"
            @keydown="onKeydown"
          ></textarea>
        </div>
      </div>
    </template>

    <div
      v-else
      class="qq9-chat-pane__empty"
    >
      未找到聊天
    </div>
  </section>
</template>

<style scoped lang="scss">
.qq9-chat-pane {
  min-width: 0;
  flex: 1;
  background: var(--qq9-chat-bg);
  display: flex;
  flex-direction: column;
  transition:
    border-right-color var(--qq9-duration-slow) var(--qq9-easing-standard);
}

.qq9-chat-pane.is-panel-open {
  border-right: 1px solid var(--qq9-border);
}

.qq9-chat-pane__header {
  min-height: 70px;
  padding: 0 14px 0 28px;
  background: #f5f7fd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--qq9-border);
}

.qq9-chat-pane__title {
  margin: 0;
  min-width: 0;
  flex: 1;
  color: #141922;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qq9-chat-pane__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
}

.qq9-chat-pane__action {
  border: none;
  background: transparent;
  padding: 5px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition:
    background-color var(--qq9-duration-normal) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: rgba(47, 134, 239, 0.08);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.94);
  }

  &.is-active {
    background: rgba(47, 134, 239, 0.14);
    transform: scale(1);
  }
}

.qq9-chat-pane__shrimp-trigger {
  box-shadow: inset 0 0 0 1px rgba(47, 134, 239, 0.14);
}

.qq9-shrimp-anchor {
  position: relative;
}

.qq9-shrimp-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: -12px;
  width: 300px;
  padding: 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 42px rgba(53, 78, 122, 0.22);
  border: 1px solid rgba(226, 232, 242, 0.95);
  z-index: 12;
  animation: qq9-slide-up var(--qq9-duration-normal) var(--qq9-easing-standard) both;
}

.qq9-shrimp-popover__menu-item {
  width: 100%;
  border: none;
  border-radius: 14px;
  background: transparent;
  padding: 14px 14px 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1a2130;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 120ms ease;

  &:hover {
    background: rgba(47, 134, 239, 0.08);
  }
}

.qq9-shrimp-popover__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 12px;
}

.qq9-shrimp-popover__back,
.qq9-shrimp-popover__close {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6e7890;
  font-size: 13px;
  cursor: pointer;
}

.qq9-shrimp-popover__back :deep(svg) {
  transform: rotate(180deg);
}

.qq9-shrimp-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px;
}

.qq9-shrimp-card__hero {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f4f8ff 0%, #edf4ff 100%);

  h3 {
    margin: 10px 0 6px;
    color: #162033;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #667186;
    font-size: 13px;
    line-height: 1.65;
  }
}

.qq9-shrimp-card__badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(47, 134, 239, 0.12);
  color: #2f86ef;
  font-size: 12px;
  font-weight: 700;
}

.qq9-shrimp-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.qq9-shrimp-card__stat {
  padding: 12px 10px;
  border-radius: 16px;
  background: #f7f9fd;
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    color: #7a8599;
    font-size: 12px;
  }

  strong {
    color: #17202f;
    font-size: 18px;
  }
}

.qq9-shrimp-card__section {
  padding: 0 2px;
}

.qq9-shrimp-card__label {
  margin: 0 0 8px;
  color: #556175;
  font-size: 12px;
  font-weight: 700;
}

.qq9-shrimp-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qq9-shrimp-card__chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #2f86ef;
  font-size: 12px;
  font-weight: 600;
}

.qq9-shrimp-card__note {
  margin: 0;
  color: #667186;
  font-size: 13px;
  line-height: 1.65;
}

.qq9-shrimp-dictionary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 310px;
  overflow-y: auto;
  padding: 4px;
}

.qq9-shrimp-dictionary__empty {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a95aa;
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

.qq9-shrimp-entry {
  padding: 14px 14px 13px;
  border-radius: 18px;
  background: #f8fafe;
  border: 1px solid rgba(229, 235, 244, 0.95);
}

.qq9-shrimp-entry__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    color: #17202f;
    font-size: 15px;
  }

  span {
    color: #8a94a8;
    font-size: 12px;
  }
}

.qq9-shrimp-entry__summary,
.qq9-shrimp-entry__evidence {
  margin: 8px 0 0;
  color: #667186;
  font-size: 13px;
  line-height: 1.6;
}

.qq9-shrimp-entry__evidence {
  color: #4f5b70;
}

.qq9-chat-pane__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.qq9-chat-pane__timeline {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 22px 0 30px;
}

.qq9-chat-pane__time {
  text-align: center;
  color: #adb3c4;
  font-size: 13px;
  line-height: 1;
  margin: 0 0 24px;
}

.qq9-shrimp-hint {
  display: flex;
  gap: 12px;
  margin: 0 0 22px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(214, 225, 244, 0.96);
  box-shadow: 0 10px 26px rgba(91, 112, 147, 0.1);
}

.qq9-shrimp-hint.is-insight {
  background: rgba(236, 246, 255, 0.98);
}

.qq9-shrimp-hint.is-approved {
  background: rgba(247, 250, 255, 0.96);
}

.qq9-shrimp-hint__icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(47, 134, 239, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.qq9-shrimp-hint__body {
  min-width: 0;
  flex: 1;
}

.qq9-shrimp-hint__text,
.qq9-shrimp-hint__accent {
  margin: 0;
  color: #243147;
  font-size: 14px;
  line-height: 1.65;
}

.qq9-shrimp-hint__accent {
  margin-top: 8px;
  color: #5f7090;
  font-size: 12px;
}

.qq9-shrimp-hint__actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.qq9-shrimp-hint__button {
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: #2f86ef;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 120ms ease,
    transform 120ms ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
  }

  &.is-secondary {
    background: #e7eef9;
    color: #63728d;
  }
}

.qq9-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
  animation: qq9-slide-up var(--qq9-duration-normal) var(--qq9-easing-standard) both;
  animation-delay: calc(var(--qq9-duration-fast) * var(--message-index, 0));
}

.qq9-message.is-outgoing {
  justify-content: flex-end;
}

.qq9-message__body {
  max-width: 500px;
}

.qq9-message__body--outgoing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.qq9-message__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}

.qq9-message__meta--outgoing {
  justify-content: flex-end;
}

.qq9-message__sender {
  color: #9aa2b4;
  font-size: 14px;
  line-height: 1;
}

.qq9-message__level {
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: #dfe3eb;
  color: #8f96a5;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
}

.qq9-message__bubble {
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 16px;
  background: var(--qq9-chat-bubble);
  box-shadow: 0 4px 16px rgba(52, 70, 104, 0.06);
}

.qq9-message__bubble--outgoing {
  background: #ffffff;
}

.qq9-message__line {
  margin: 0;
  color: #1d2330;
  font-size: 16px;
  line-height: 1.58;
  white-space: pre-wrap;
  word-break: break-word;
}

.qq9-quote {
  border-left: 3px solid #d6dbe5;
  padding-left: 12px;
}

.qq9-quote__speaker,
.qq9-quote__line {
  margin: 0;
  color: #535c6d;
  font-size: 15px;
  line-height: 1.5;
}

.qq9-chat-pane__composer {
  height: 152px;
  flex-shrink: 0;
  border-top: 1px solid var(--qq9-border);
  background: #fff;
  padding: 14px 20px 16px 28px;
  display: flex;
  flex-direction: column;
}

.qq9-chat-pane__composer-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.qq9-chat-pane__composer-button {
  border: none;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition:
    opacity var(--qq9-duration-fast) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    opacity: 0.72;
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }
}

.qq9-chat-pane__composer-input {
  width: 100%;
  min-height: 0;
  flex: 1;
  margin-top: 14px;
  border: none;
  resize: none;
  overflow-y: auto;
  background: transparent;
  color: #1c2230;
  font-size: 16px;
  line-height: 1.65;
  outline: none;
  caret-color: var(--qq9-blue-strong);
}

.qq9-chat-pane__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93a0b5;
  font-size: 16px;
}
</style>
