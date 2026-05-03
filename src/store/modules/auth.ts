import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchSession,
  loginWithDemoAccount,
  logoutSession,
} from '@/services/auth'
import {
  toQQCurrentUser,
  type AuthLoginRequest,
  type AuthSessionSnapshot,
  type AuthUserProfile,
} from '@/types/auth'

type AuthStatus = 'booting' | 'anonymous' | 'submitting' | 'authenticated'

const resolveErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '登录服务暂时不可用，请稍后再试。'

export const useAuthStore = defineStore('auth', () => {
  const status = ref<AuthStatus>('booting')
  const sessionReady = ref(false)
  const profile = ref<AuthUserProfile | null>(null)
  const errorMessage = ref('')

  const currentUser = computed(() =>
    profile.value ? toQQCurrentUser(profile.value) : null
  )

  const isAuthenticated = computed(
    () => status.value === 'authenticated' && Boolean(profile.value)
  )

  const clearError = () => {
    errorMessage.value = ''
  }

  const applySessionSnapshot = (snapshot: AuthSessionSnapshot) => {
    profile.value = snapshot.authenticated ? snapshot.user : null
    status.value =
      snapshot.authenticated && snapshot.user ? 'authenticated' : 'anonymous'
    sessionReady.value = true
  }

  const setAnonymous = () => {
    profile.value = null
    status.value = 'anonymous'
    sessionReady.value = true
  }

  const reset = () => {
    profile.value = null
    errorMessage.value = ''
    status.value = 'booting'
    sessionReady.value = false
  }

  const hydrateSession = async () => {
    clearError()

    try {
      const snapshot = await fetchSession()
      applySessionSnapshot(snapshot)
    } catch {
      setAnonymous()
    }
  }

  const login = async (payload: AuthLoginRequest) => {
    clearError()
    status.value = 'submitting'

    try {
      const snapshot = await loginWithDemoAccount(payload)
      applySessionSnapshot(snapshot)
      return snapshot.authenticated
    } catch (error) {
      setAnonymous()
      errorMessage.value = resolveErrorMessage(error)
      return false
    }
  }

  const logout = async () => {
    clearError()

    try {
      await logoutSession()
      setAnonymous()
      return true
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error)
      return false
    }
  }

  return {
    status,
    sessionReady,
    profile,
    currentUser,
    isAuthenticated,
    errorMessage,
    clearError,
    reset,
    hydrateSession,
    login,
    logout,
  }
})
