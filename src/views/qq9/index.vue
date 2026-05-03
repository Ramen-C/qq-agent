<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QQChatPane from './components/QQChatPane.vue'
import QQConversationList from './components/QQConversationList.vue'
import QQGroupInfoPane from './components/QQGroupInfoPane.vue'
import QQSidebar from './components/QQSidebar.vue'
import QQWaveBackground from './components/QQWaveBackground.vue'
import { useAuthStore } from '@/store/modules/auth'
import { useQq9ShellStore } from '@/store/modules/qq9Shell'
import { useShrimpAgentStore } from '@/store/modules/shrimpAgent'
import type { QQCurrentUser } from '@/types/qq9Shell'

const shellStore = useQq9ShellStore()
const authStore = useAuthStore()
const shrimpStore = useShrimpAgentStore()
const router = useRouter()

const fallbackCurrentUser: QQCurrentUser = {
  name: '当前用户',
  avatar: {
    kind: 'placeholder',
    label: '我',
    background: '#eef1f5',
    color: '#8f96a5',
  },
  online: true,
}

onMounted(() => {
  shellStore.bootstrap()
})

const seed = computed(() => shellStore.seed)
const currentUser = computed(() => authStore.currentUser || fallbackCurrentUser)
const accountNumber = computed(() => authStore.profile?.qqNumber || '')

const handleSend = () => {
  if (!authStore.currentUser) {
    return
  }

  shellStore.sendDraft(authStore.currentUser)
}

const handleLogout = async () => {
  const didLogout = await authStore.logout()

  if (!didLogout) {
    return
  }

  shrimpStore.reset()
  shellStore.reset()
  await router.replace({ name: 'QQLogin' })
}
</script>

<template>
  <div class="qq9-shell-page">
    <q-q-wave-background />
    <div class="qq9-shell-shell">
      <div
        v-if="!seed"
        class="qq9-shell-state"
      >
        正在加载 QQ9 界面...
      </div>

      <div
        v-else
        class="qq9-shell-window"
      >
        <q-q-sidebar
          :brand="seed.brand"
          :current-user="currentUser"
          :account-number="accountNumber"
          :primary-items="seed.primarySidebarItems"
          :secondary-items="seed.secondarySidebarItems"
          @logout="handleLogout"
        />
        <q-q-conversation-list
          :search-placeholder="seed.searchPlaceholder"
          :add-action-icon="seed.addActionIcon"
          :conversations="shellStore.filteredConversations"
          :active-conversation-id="shellStore.activeConversationId"
          :query="shellStore.conversationQuery"
          @select="shellStore.selectConversation"
          @update-query="shellStore.setConversationQuery"
        />
        <q-q-chat-pane
          :conversation="shellStore.currentConversation"
          :current-user-name="currentUser.name"
          :current-user-avatar="currentUser.avatar"
          :draft="shellStore.currentDraft"
          :panel-open="shellStore.isInfoPanelOpen"
          @toggle-info-panel="shellStore.toggleInfoPanel"
          @update-draft="shellStore.setDraft"
          @send="handleSend"
        />
        <Transition name="qq9-panel-slide">
          <q-q-group-info-pane
            v-if="shellStore.currentConversation && shellStore.isInfoPanelOpen"
            :notice="shellStore.currentConversation.notice"
            :members="shellStore.filteredMembers"
            :member-count="shellStore.currentConversation.memberCount"
            :search-open="shellStore.isMemberSearchOpen"
            :search-query="shellStore.memberQuery"
            @toggle-search="shellStore.toggleMemberSearch"
            @update-search-query="shellStore.setMemberQuery"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qq9-shell-page {
  min-height: 100vh;
  padding: 24px 30px 24px;
  background: var(--qq9-bg);
  position: relative;
  overflow: hidden;
}

.qq9-shell-shell {
  width: 100%;
  height: calc(100vh - 48px);
  position: relative;
  z-index: 1;
}

.qq9-shell-window {
  height: 100%;
  background: var(--qq9-window);
  border-radius: var(--qq9-window-radius);
  overflow: hidden;
  display: flex;
  box-shadow: var(--qq9-shadow);
  backdrop-filter: blur(22px) saturate(1.08);
}

.qq9-shell-state {
  height: 100%;
  border-radius: var(--qq9-window-radius);
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667085;
  font-size: 16px;
  letter-spacing: 0.02em;
}
</style>
