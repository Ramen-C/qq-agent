<script setup lang="ts">
import { computed } from 'vue'
import type { QQAvatar as QQAvatarShape, QQAvatarImageKey } from '@/types/qq9Shell'

const props = withDefaults(
  defineProps<{
    avatar: QQAvatarShape
    size?: number
    rounded?: number
  }>(),
  {
    size: 44,
    rounded: 999,
  }
)

const createAvatarSvg = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

const avatarMap: Record<QQAvatarImageKey, string> = {
  'avatar-1': createAvatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4d8"/>
          <stop offset="100%" stop-color="#ffc57f"/>
        </linearGradient>
      </defs>
      <rect width="88" height="88" rx="22" fill="url(#g1)"/>
      <circle cx="44" cy="36" r="17" fill="#fffaf2"/>
      <path d="M20 72c5-15 18-23 24-23s19 8 24 23" fill="#ff8b6f"/>
      <path d="M29 24c4-7 12-11 15-11s11 4 15 11" fill="#2f5bd3"/>
      <circle cx="38" cy="36" r="2.6" fill="#2b3140"/>
      <circle cx="50" cy="36" r="2.6" fill="#2b3140"/>
      <path d="M38 43c3 3 9 3 12 0" stroke="#2b3140" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>
  `),
  'avatar-2': createAvatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dff0ff"/>
          <stop offset="100%" stop-color="#8ab8ff"/>
        </linearGradient>
      </defs>
      <rect width="88" height="88" rx="22" fill="url(#g2)"/>
      <circle cx="60" cy="24" r="10" fill="#ffe08a"/>
      <path d="M22 60c0-14 11-25 24-25s24 11 24 25v10H22V60z" fill="#ffffff"/>
      <path d="M30 44c4-6 10-9 16-9s12 3 16 9" fill="#5d84e6"/>
      <circle cx="40" cy="54" r="2.5" fill="#2d3650"/>
      <circle cx="52" cy="54" r="2.5" fill="#2d3650"/>
      <path d="M40 61c3 2 9 2 12 0" stroke="#2d3650" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>
  `),
  'avatar-3': createAvatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88">
      <defs>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#202f45"/>
          <stop offset="100%" stop-color="#4d6a8f"/>
        </linearGradient>
      </defs>
      <rect width="88" height="88" rx="22" fill="url(#g3)"/>
      <circle cx="44" cy="32" r="16" fill="#f2f6fb"/>
      <path d="M20 72c5-14 17-21 24-21s19 7 24 21" fill="#5abf8a"/>
      <path d="M28 27l10-8 8 8 14-9v14H28z" fill="#ff8fa6"/>
      <circle cx="38" cy="33" r="2.5" fill="#223048"/>
      <circle cx="50" cy="33" r="2.5" fill="#223048"/>
      <path d="M38 40c2 3 10 3 12 0" stroke="#223048" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>
  `),
  'avatar-4': createAvatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88">
      <defs>
        <linearGradient id="g4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#efe7ff"/>
          <stop offset="100%" stop-color="#c0b0ff"/>
        </linearGradient>
      </defs>
      <rect width="88" height="88" rx="22" fill="url(#g4)"/>
      <circle cx="44" cy="36" r="17" fill="#fff9ff"/>
      <path d="M22 72c6-15 18-23 22-23 8 0 19 8 22 23" fill="#ffb067"/>
      <path d="M30 24c4-7 11-10 14-10 6 0 12 3 16 10" fill="#7a62d6"/>
      <circle cx="38" cy="36" r="2.6" fill="#2f3055"/>
      <circle cx="50" cy="36" r="2.6" fill="#2f3055"/>
      <path d="M39 43c2 2 8 2 10 0" stroke="#2f3055" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="62" cy="22" r="5" fill="#fff"/>
      <path d="M62 14v16M54 22h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),
}

const imageList = computed(() =>
  (props.avatar.imageKeys || []).map((key) => avatarMap[key])
)

const imageSrc = computed(() =>
  props.avatar.imageKey ? avatarMap[props.avatar.imageKey] : ''
)

const fallbackStyle = computed(() => ({
  background: props.avatar.background || '#edf0f4',
  color: props.avatar.color || '#7b8396',
}))
</script>

<template>
  <div
    class="qq9-avatar"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${rounded}px`,
    }"
  >
    <img
      v-if="avatar.kind === 'image'"
      :src="imageSrc"
      :alt="avatar.label || 'avatar'"
      class="qq9-avatar__image"
    />
    <div
      v-else-if="avatar.kind === 'group'"
      class="qq9-avatar__group qq9-avatar-stack"
      :style="{ borderRadius: `${rounded}px` }"
    >
      <img
        v-for="(item, index) in imageList"
        :key="`${item}-${index}`"
        :src="item"
        alt="group avatar"
        class="qq9-avatar__image"
      />
    </div>
    <div
      v-else
      class="qq9-avatar__fallback"
      :style="fallbackStyle"
    >
      {{ avatar.label }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.qq9-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform var(--qq9-duration-fast) var(--qq9-easing-standard);

  &:hover {
    transform: scale(1.04);
  }
}

.qq9-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qq9-avatar__group {
  width: 100%;
  height: 100%;
  padding: 3px;
  background: #fff;
}

.qq9-avatar__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
</style>
