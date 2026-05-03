import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import { useAuthStore } from '@/store/modules/auth'
import { pinia } from '@/store'
import '@/assets/styles/index.scss'

const bootstrap = async () => {
  const app = createApp(App)

  app.use(pinia)

  const authStore = useAuthStore(pinia)
  await authStore.hydrateSession()

  app.use(router)
  app.mount('#app')
}

void bootstrap()
