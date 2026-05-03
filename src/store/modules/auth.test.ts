import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  createPinia,
  setActivePinia,
} from 'pinia'
import { useAuthStore } from './auth'
import type { AuthUserProfile } from '@/types/auth'

const authServiceMocks = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  loginWithDemoAccount: vi.fn(),
  logoutSession: vi.fn(),
}))

vi.mock('@/services/auth', () => ({
  fetchSession: authServiceMocks.fetchSession,
  loginWithDemoAccount: authServiceMocks.loginWithDemoAccount,
  logoutSession: authServiceMocks.logoutSession,
}))

const demoProfile: AuthUserProfile = {
  userId: 'demo001',
  qqNumber: '240001',
  displayName: '星火社团体验号',
  avatar: {
    kind: 'image',
    imageKey: 'avatar-1',
  },
  online: true,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    authServiceMocks.fetchSession.mockReset()
    authServiceMocks.loginWithDemoAccount.mockReset()
    authServiceMocks.logoutSession.mockReset()
  })

  it('hydrates an authenticated session snapshot', async () => {
    authServiceMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: demoProfile,
    })

    const store = useAuthStore()
    await store.hydrateSession()

    expect(store.sessionReady).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.currentUser?.name).toBe('星火社团体验号')
  })

  it('captures login failure messages and falls back to anonymous', async () => {
    authServiceMocks.loginWithDemoAccount.mockRejectedValue(
      new Error('账号或密码错误，请核对说明文档中的体验账号。')
    )

    const store = useAuthStore()
    const didLogin = await store.login({
      account: 'reviewer01',
      password: 'wrong-pass',
    })

    expect(didLogin).toBe(false)
    expect(store.status).toBe('anonymous')
    expect(store.errorMessage).toContain('账号或密码错误')
  })

  it('clears session state after logout succeeds', async () => {
    authServiceMocks.fetchSession.mockResolvedValue({
      authenticated: true,
      user: demoProfile,
    })
    authServiceMocks.logoutSession.mockResolvedValue(undefined)

    const store = useAuthStore()
    await store.hydrateSession()

    const didLogout = await store.logout()

    expect(didLogout).toBe(true)
    expect(store.isAuthenticated).toBe(false)
    expect(store.currentUser).toBeNull()
  })
})
