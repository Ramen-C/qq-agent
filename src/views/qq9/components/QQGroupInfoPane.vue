<script setup lang="ts">
import type {
  QQGroupMember,
  QQGroupNotice,
} from '@/types/qq9Shell'
import QQAvatar from './QQAvatar.vue'
import QQIcon from './QQIcon.vue'

defineProps<{
  notice: QQGroupNotice
  members: QQGroupMember[]
  memberCount: number
  searchOpen: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  toggleSearch: []
  updateSearchQuery: [query: string]
}>()

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('updateSearchQuery', target.value)
}
</script>

<template>
  <aside class="qq9-group-panel">
    <section class="qq9-group-panel__section qq9-group-panel__section--notice">
      <div class="qq9-group-panel__heading">
        <h2>{{ notice.title }}</h2>
        <q-q-icon
          name="chevron-right"
          :size="18"
          color="#1d2330"
        />
      </div>
      <p class="qq9-group-panel__notice">
        {{ notice.body }}
      </p>
    </section>

    <section class="qq9-group-panel__section qq9-group-panel__section--members">
      <div class="qq9-group-panel__heading">
        <h2>群聊成员 {{ memberCount }}</h2>
        <button
          class="qq9-group-panel__search-toggle"
          type="button"
          @click="emit('toggleSearch')"
        >
          <q-q-icon
            name="search"
            :size="18"
            color="#1d2330"
          />
        </button>
      </div>

      <div
        v-if="searchOpen"
        class="qq9-group-panel__search"
      >
        <input
          class="qq9-group-panel__search-input"
          :value="searchQuery"
          placeholder="搜索群成员"
          @input="onSearchInput"
        />
      </div>

      <div class="qq9-group-panel__members qq9-scrollbar">
        <div
          v-if="members.length === 0"
          class="qq9-group-panel__empty"
        >
          未找到成员
        </div>

        <article
          v-for="member in members"
          :key="member.id"
          class="qq9-group-member"
        >
          <q-q-avatar
            :avatar="member.avatar"
            :size="34"
            :rounded="17"
          />
          <span class="qq9-group-member__name">{{ member.name }}</span>
          <span
            v-if="member.roleLabel"
            class="qq9-group-member__role"
          >
            {{ member.roleLabel }}
          </span>
        </article>
      </div>
    </section>
  </aside>
</template>

<style scoped lang="scss">
.qq9-group-panel {
  width: var(--qq9-panel-width);
  background: var(--qq9-blue-panel);
  display: flex;
  flex-direction: column;
}

.qq9-group-panel__section {
  padding: 28px 20px 0;
}

.qq9-group-panel__section--notice {
  min-height: 282px;
  border-bottom: 1px solid rgba(207, 219, 240, 0.95);
}

.qq9-group-panel__section--members {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.qq9-group-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    color: #171b24;
    font-size: 17px;
    font-weight: 700;
  }
}

.qq9-group-panel__search-toggle {
  border: none;
  background: transparent;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color var(--qq9-duration-normal) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: rgba(47, 134, 239, 0.08);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }
}

.qq9-group-panel__search {
  margin-top: 12px;
}

.qq9-group-panel__search-input {
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  padding: 0 14px;
  color: #4d5668;
  font-size: 14px;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(206, 215, 229, 0.9);
  transition:
    box-shadow var(--qq9-duration-normal) var(--qq9-easing-standard);

  &:focus {
    box-shadow: inset 0 0 0 1px var(--qq9-blue-strong), 0 0 0 3px rgba(47, 134, 239, 0.1);
  }
}

.qq9-group-panel__notice {
  margin: 22px 0 0;
  color: #949cab;
  font-size: 14px;
  line-height: 1.75;
}

.qq9-group-panel__members {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 18px 0 18px;
}

.qq9-group-panel__empty {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa2b4;
  font-size: 14px;
}

.qq9-group-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 6px;
  border-radius: 10px;
  cursor: default;
  transition:
    background-color var(--qq9-duration-fast) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: translateX(2px);
  }
}

.qq9-group-member__name {
  min-width: 0;
  flex: 1;
  color: #788193;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qq9-group-member__role {
  flex-shrink: 0;
  height: 22px;
  padding: 0 8px;
  border-radius: 8px;
  background: #ffb27a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 22px;
}
</style>
