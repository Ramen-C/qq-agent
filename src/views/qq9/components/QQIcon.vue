<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    size?: number
    color?: string
    strokeWidth?: number
  }>(),
  {
    size: 22,
    color: '#1f2430',
    strokeWidth: 1.8,
  }
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <template v-if="name === 'messages'">
      <path d="M5 7.5C5 6.12 6.12 5 7.5 5h9C17.88 5 19 6.12 19 7.5v5.2c0 1.38-1.12 2.5-2.5 2.5H11l-3.5 3v-3H7.5A2.5 2.5 0 0 1 5 12.7V7.5Z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
      <circle cx="9" cy="10.3" r="0.8" :fill="color" />
      <circle cx="12" cy="10.3" r="0.8" :fill="color" />
      <circle cx="15" cy="10.3" r="0.8" :fill="color" />
    </template>
    <template v-else-if="name === 'contacts'">
      <circle cx="12" cy="8" r="3.1" :stroke="color" :stroke-width="strokeWidth" />
      <path d="M6.2 18.5c0-2.93 2.6-4.8 5.8-4.8s5.8 1.87 5.8 4.8" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="m12 4.7 2.05 4.16 4.58.67-3.32 3.23.78 4.56L12 15.16 7.91 17.3l.78-4.56-3.32-3.23 4.58-.67L12 4.7Z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'channels'">
      <path d="M5 8.3h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M5 15.7h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M8.2 5 5 19" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M19 5 15.8 19" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'cloud'">
      <path d="M8 17.4h8a3.6 3.6 0 0 0 .43-7.18A5.1 5.1 0 0 0 6.1 11.8 2.8 2.8 0 0 0 8 17.4Z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'docs'">
      <path d="M8 4.8h6l3 3v11.4H8z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
      <path d="M14 4.8v3h3" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'grid'">
      <rect x="5.3" y="5.3" width="4.2" height="4.2" rx="0.8" :fill="color" />
      <rect x="14.5" y="5.3" width="4.2" height="4.2" rx="0.8" :fill="color" />
      <rect x="5.3" y="14.5" width="4.2" height="4.2" rx="0.8" :fill="color" />
      <rect x="14.5" y="14.5" width="4.2" height="4.2" rx="0.8" :fill="color" />
    </template>
    <template v-else-if="name === 'mail'">
      <path d="M4.8 7.2h14.4v9.6H4.8z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
      <path d="m5.6 8 6.4 5.1L18.4 8" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'folder'">
      <path d="M4.8 8.2h5.1l1.3 1.5h8v7.5H4.8z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'bookmark'">
      <path d="M7.3 5.2h9.4v13.6L12 15.8l-4.7 3V5.2Z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M5 7h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M5 12h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M5 17h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M5 12h14" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="4.5" :stroke="color" :stroke-width="strokeWidth" />
      <path d="m14 14 4 4" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'shrimp'">
      <path d="M17.4 8.4c-.53-1.47-1.83-2.65-3.56-3.06-2.8-.66-5.7.84-6.48 3.35-.46 1.49-.12 3.12.84 4.42-.47.44-.9.97-1.27 1.59-.74 1.25-.8 2.7-.15 3.73.6.94 1.72 1.39 3 1.33" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.9 8.2c1.95-.88 4.28-.44 5.4 1.07 1.15 1.54.94 3.75-.53 5.2-1.5 1.48-3.86 1.87-5.7.95" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="13.5" cy="9.3" r="0.9" :fill="color" />
      <path d="M15.8 15.2c.7.55 1.54.9 2.47 1.02" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="m17.8 13.6 2.4 1.5-2.7.7" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'mute'">
      <path d="M5 10h3l4-3v10l-4-3H5z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
      <path d="m17.5 8.5-4 7" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'phone'">
      <path d="M8 6.2c.42-.42 1.07-.5 1.58-.18l1.52.96c.55.35.78 1.03.54 1.65l-.43 1.09a11.37 11.37 0 0 0 3.05 3.05l1.09-.43a1.47 1.47 0 0 1 1.65.54l.96 1.52c.32.5.25 1.15-.18 1.58l-.82.82c-.67.67-1.67.96-2.61.68-2.28-.68-4.2-1.96-5.85-3.61S6 10.77 5.32 8.5c-.28-.95 0-1.95.68-2.62L8 6.2Z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'video'">
      <rect x="4.8" y="7.2" width="10" height="9.6" rx="1.2" :stroke="color" :stroke-width="strokeWidth" />
      <path d="m14.8 10.2 4.4-2.6v8.8l-4.4-2.6" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'share'">
      <rect x="6.2" y="7.8" width="11.6" height="8.6" rx="1.2" :stroke="color" :stroke-width="strokeWidth" />
      <path d="m12 6.1 3.3 3.4H8.7L12 6.1Z" :fill="color" />
      <path d="M12 9.5V4.8" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'add-user'">
      <circle cx="10" cy="9" r="3" :stroke="color" :stroke-width="strokeWidth" />
      <path d="M4.8 18c0-2.6 2.2-4.2 5.2-4.2" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M17 10v6" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M14 13h6" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'more'">
      <circle cx="6.5" cy="12" r="1.3" :fill="color" />
      <circle cx="12" cy="12" r="1.3" :fill="color" />
      <circle cx="17.5" cy="12" r="1.3" :fill="color" />
    </template>
    <template v-else-if="name === 'emoji'">
      <circle cx="12" cy="12" r="7" :stroke="color" :stroke-width="strokeWidth" />
      <circle cx="9.2" cy="10.3" r="0.8" :fill="color" />
      <circle cx="14.8" cy="10.3" r="0.8" :fill="color" />
      <path d="M9 14.4c.7.88 1.73 1.4 3 1.4s2.3-.52 3-1.4" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'scissors'">
      <circle cx="7.5" cy="8.5" r="2" :stroke="color" :stroke-width="strokeWidth" />
      <circle cx="7.5" cy="15.5" r="2" :stroke="color" :stroke-width="strokeWidth" />
      <path d="M9.2 10 18 5.5" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="m9.2 14 8.8 4.5" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'image'">
      <rect x="4.8" y="5.8" width="14.4" height="12.4" rx="1.3" :stroke="color" :stroke-width="strokeWidth" />
      <circle cx="9" cy="10" r="1.1" :fill="color" />
      <path d="m7 16 3.6-3.5 2.5 2.2 1.8-1.7 3.1 3" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'envelope'">
      <path d="M5 8h14v8H5z" :stroke="color" :stroke-width="strokeWidth" stroke-linejoin="round" />
      <path d="m5.8 8.8 6.2 4.6 6.2-4.6" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'mic'">
      <rect x="9.2" y="5.8" width="5.6" height="8.8" rx="2.8" :stroke="color" :stroke-width="strokeWidth" />
      <path d="M7.3 11.8a4.7 4.7 0 0 0 9.4 0" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M12 16.5v3" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
      <path d="M9.5 19.5h5" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'history'">
      <circle cx="12" cy="12" r="7" :stroke="color" :stroke-width="strokeWidth" />
      <path d="M12 8.5v4.3l2.8 1.7" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9.2 6.8 5.2 5.2-5.2 5.2" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6.8 9.5 5.2 5.2 5.2-5.2" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
    </template>
  </svg>
</template>
