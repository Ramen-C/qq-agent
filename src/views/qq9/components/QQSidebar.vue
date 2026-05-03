<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import type {
  QQCurrentUser,
  QQSidebarItem,
} from '@/types/qq9Shell'
import QQAvatar from './QQAvatar.vue'
import QQIcon from './QQIcon.vue'

defineProps<{
  brand: string
  currentUser: QQCurrentUser
  accountNumber: string
  primaryItems: QQSidebarItem[]
  secondaryItems: QQSidebarItem[]
}>()

const emit = defineEmits<{
  logout: []
}>()

const renderIcon = (active = false) => ({
  color: active ? 'var(--qq9-blue-strong)' : '#fff',
})

const menuRef = ref<HTMLElement | null>(null)
const isAccountMenuOpen = ref(false)

const toggleAccountMenu = () => {
  isAccountMenuOpen.value = !isAccountMenuOpen.value
}

const closeAccountMenu = () => {
  isAccountMenuOpen.value = false
}

const onWindowPointerDown = (event: PointerEvent) => {
  if (!isAccountMenuOpen.value || !menuRef.value) {
    return
  }

  const target = event.target as Node | null

  if (target && menuRef.value.contains(target)) {
    return
  }

  closeAccountMenu()
}

const handleLogout = () => {
  closeAccountMenu()
  emit('logout')
}

onMounted(() => {
  window.addEventListener('pointerdown', onWindowPointerDown)
})

onUnmounted(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown)
})
</script>

<template>
  <aside class="qq9-rail">
    <div class="qq9-rail__top">
      <div class="qq9-window-dots">
        <span class="qq9-window-dot"></span>
        <span class="qq9-window-dot"></span>
        <span class="qq9-window-dot"></span>
      </div>
      <p class="qq9-rail__brand">{{ brand }}</p>

      <div
        ref="menuRef"
        class="qq9-rail__user-wrap"
      >
        <button
          class="qq9-rail__user"
          type="button"
          @click="toggleAccountMenu"
        >
          <q-q-avatar
            :avatar="currentUser.avatar"
            :size="46"
            :rounded="23"
          />
          <span
            v-if="currentUser.online"
            class="qq9-rail__user-dot"
          ></span>
        </button>

        <div
          v-if="isAccountMenuOpen"
          class="qq9-rail__account-menu"
        >
          <p class="qq9-rail__account-name">{{ currentUser.name }}</p>
          <p class="qq9-rail__account-number">QQ {{ accountNumber }}</p>
          <button
            class="qq9-rail__account-action"
            type="button"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>

    <div class="qq9-rail__main">
      <button
        v-for="item in primaryItems"
        :key="item.key"
        class="qq9-rail__button"
        :class="{ 'is-active': item.active }"
        type="button"
      >
        <span
          v-if="item.badge"
          class="qq9-rail__badge"
        >
          {{ item.badge }}
        </span>
        <span
          v-if="item.dot"
          class="qq9-rail__dot"
        ></span>

        <q-q-icon
          :name="item.icon.name"
          :size="item.icon.size || 22"
          v-bind="renderIcon(item.active)"
        />
      </button>
    </div>

    <div class="qq9-rail__secondary">
      <button
        v-for="item in secondaryItems"
        :key="item.key"
        class="qq9-rail__button qq9-rail__button--small"
        type="button"
      >
        <span
          v-if="item.dot"
          class="qq9-rail__dot qq9-rail__dot--small"
        ></span>
        <q-q-icon
          :name="item.icon.name"
          :size="item.icon.size || 20"
          v-bind="renderIcon()"
        />
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.qq9-rail {
  width: var(--qq9-rail-width);
  height: 100%;
  background: var(--qq9-sidebar);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0 16px;
  color: #fff;
}

.qq9-rail__top {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qq9-rail__brand {
  margin-top: 18px;
  font-size: 18px;
  line-height: 1;
  letter-spacing: 0.5px;
}

.qq9-rail__user-wrap {
  position: relative;
}

.qq9-rail__user {
  position: relative;
  margin-top: 28px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: transform var(--qq9-duration-fast) var(--qq9-easing-standard),
    filter var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    transform: scale(1.06);
    filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.28));
  }
}

.qq9-rail__user-dot {
  position: absolute;
  right: -1px;
  bottom: 0;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid #fff;
  background: #38d26d;
}

.qq9-rail__account-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 2;
  width: 170px;
  padding: 14px 12px 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  color: #1f2430;
  box-shadow: 0 18px 40px rgba(17, 24, 39, 0.18);
  transform: translateX(-50%);
}

.qq9-rail__account-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.qq9-rail__account-number {
  margin: 6px 0 0;
  color: #667085;
  font-size: 12px;
}

.qq9-rail__account-action {
  width: 100%;
  margin-top: 12px;
  height: 36px;
  border: none;
  border-radius: 12px;
  background: rgba(47, 134, 239, 0.12);
  color: #2f86ef;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.qq9-rail__main {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.qq9-rail__secondary {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qq9-rail__button {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 14px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color var(--qq9-duration-normal) var(--qq9-easing-standard),
    transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }

  &.is-active {
    background: #ffffff;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
    transform: scale(1);
  }
}

.qq9-rail__button--small {
  width: 34px;
  height: 34px;
  border-radius: 11px;

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }
}

.qq9-rail__badge {
  position: absolute;
  right: -10px;
  top: -1px;
  min-width: 28px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: #ff663c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  box-shadow: 0 3px 8px rgba(255, 102, 60, 0.28);
}

.qq9-rail__dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #ff5a4e;
}

.qq9-rail__dot--small {
  top: 3px;
  right: 2px;
}
</style>
