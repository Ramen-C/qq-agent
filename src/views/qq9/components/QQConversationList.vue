<script setup lang="ts">
import { computed } from 'vue'
import type {
  QQConversationSummary,
  QQIconSpec,
} from '@/types/qq9Shell'
import QQAvatar from './QQAvatar.vue'
import QQIcon from './QQIcon.vue'

const props = defineProps<{
  searchPlaceholder: string
  addActionIcon: QQIconSpec
  conversations: QQConversationSummary[]
  activeConversationId: string
  query: string
}>()

const emit = defineEmits<{
  select: [id: string]
  updateQuery: [query: string]
}>()

const hasNoResults = computed(() => props.conversations.length === 0)

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('updateQuery', target.value)
}
</script>

<template>
  <section class="qq9-conversation-list">
    <div class="qq9-conversation-list__toolbar">
      <label class="qq9-search">
        <q-q-icon
          name="search"
          :size="18"
          color="#9ea6b5"
        />
        <input
          class="qq9-search__input"
          :value="query"
          :placeholder="searchPlaceholder"
          @input="onSearchInput"
        />
      </label>
      <button
        class="qq9-plus-button"
        type="button"
        aria-label="新建会话"
      >
        <q-q-icon
          :name="addActionIcon.name"
          :size="addActionIcon.size || 22"
          color="#80889b"
        />
      </button>
    </div>

    <div class="qq9-conversation-list__items qq9-scrollbar">
      <div
        v-if="hasNoResults"
        class="qq9-conversation-list__empty"
      >
        未找到聊天
      </div>

      <article
        v-for="conversation in conversations"
        :key="conversation.id"
        class="qq9-conversation-item"
        :class="{ 'is-active': conversation.id === activeConversationId }"
        @click="emit('select', conversation.id)"
      >
        <q-q-avatar
          :avatar="conversation.avatar"
          :size="56"
          :rounded="28"
        />

        <div class="qq9-conversation-item__body">
          <div class="qq9-conversation-item__meta">
            <p class="qq9-conversation-item__title">{{ conversation.title }}</p>
            <span class="qq9-conversation-item__time">
              {{ conversation.timeLabel }}
            </span>
          </div>

          <div class="qq9-conversation-item__preview-row">
            <p class="qq9-conversation-item__preview">
              <span
                v-if="conversation.previewPrefix"
                :class="[
                  'qq9-conversation-item__prefix',
                  conversation.previewPrefixTone
                    ? `is-${conversation.previewPrefixTone}`
                    : '',
                ]"
              >
                {{ conversation.previewPrefix }}
              </span>
              <span>{{ conversation.preview }}</span>
            </p>

            <q-q-icon
              v-if="conversation.muted"
              name="mute"
              :size="16"
              color="#9ca5b4"
            />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.qq9-conversation-list {
  width: var(--qq9-list-width);
  height: 100%;
  background: #fff;
  border-right: 1px solid var(--qq9-border);
  display: flex;
  flex-direction: column;
}

.qq9-conversation-list__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 15px 18px;
  border-bottom: 1px solid var(--qq9-border);
}

.qq9-search {
  height: 42px;
  flex: 1;
  border-radius: 12px;
  background: #f2f4f8;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  color: #9ea6b5;
  font-size: 15px;
  box-shadow: 0 0 0 0 transparent;
  transition:
    box-shadow var(--qq9-duration-normal) var(--qq9-easing-standard),
    background-color var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 3px rgba(47, 134, 239, 0.12);
  }
}

.qq9-search__input {
  width: 100%;
  border: none;
  background: transparent;
  color: #4f5666;
  font-size: 15px;
  outline: none;
}

.qq9-plus-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: #f2f4f8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color var(--qq9-duration-fast) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: #ecf1f8;
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.94);
  }
}

.qq9-conversation-list__items {
  flex: 1;
  overflow-y: auto;
}

.qq9-conversation-list__empty {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa2b4;
  font-size: 15px;
}

.qq9-conversation-item {
  display: flex;
  gap: 14px;
  padding: 15px 18px 15px 20px;
  cursor: pointer;
  transition:
    background-color var(--qq9-duration-normal) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: rgba(220, 234, 255, 0.58);
    transform: translateX(2px);
  }

  &:active {
    transform: scale(0.985);
  }

  &.is-active {
    background: var(--qq9-blue-soft);
    transform: translateX(0);
  }
}

.qq9-conversation-item__body {
  min-width: 0;
  flex: 1;
}

.qq9-conversation-item__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.qq9-conversation-item__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--qq9-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qq9-conversation-item__time {
  flex-shrink: 0;
  color: #98a0b0;
  font-size: 12px;
  line-height: 20px;
}

.qq9-conversation-item__preview-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.qq9-conversation-item__preview {
  min-width: 0;
  margin: 0;
  flex: 1;
  color: #9ea6b5;
  font-size: 13px;
  line-height: 19px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qq9-conversation-item__prefix.is-danger {
  color: #ff6335;
}

.qq9-conversation-item__prefix.is-warning {
  color: #f5a623;
}

.qq9-conversation-item__prefix.is-muted {
  color: #9099a9;
}
</style>
