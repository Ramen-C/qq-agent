import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { pinia } from '@/store'
import { useAuthStore } from '@/store/modules/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'QQLogin',
    component: () => import('@/views/login/index.vue'),
    meta: {
      guestOnly: true,
      hidden: true,
    },
  },
  {
    path: '/',
    name: 'QQ9Home',
    component: () => import('@/views/qq9/index.vue'),
    meta: {
      requiresAuth: true,
      hidden: true,
    },
  },
  {
    path: '/qq9',
    redirect: '/',
    meta: {
      hidden: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const resolveAuthRedirect = (
  to: {
    fullPath: string
    meta: {
      requiresAuth?: boolean
      guestOnly?: boolean
    }
  },
  isAuthenticated: boolean
) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'QQLogin',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return {
      name: 'QQ9Home',
    }
  }

  return null
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)

  if (!authStore.sessionReady) {
    await authStore.hydrateSession()
  }

  return resolveAuthRedirect(to, authStore.isAuthenticated) || true
})

export default router
