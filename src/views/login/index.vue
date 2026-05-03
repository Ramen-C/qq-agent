<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import QQWaveBackground from '@/views/qq9/components/QQWaveBackground.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const form = reactive({
  account: '',
  password: '',
})

const localErrorMessage = ref('')

const canSubmit = computed(
  () =>
    form.account.trim().length > 0 &&
    form.password.trim().length > 0 &&
    authStore.status !== 'submitting'
)

const surfaceErrorMessage = computed(
  () => localErrorMessage.value || authStore.errorMessage
)

const handleSubmit = async () => {
  authStore.clearError()
  localErrorMessage.value = ''

  if (!form.account.trim() || !form.password.trim()) {
    localErrorMessage.value = '请输入体验账号和密码。'
    return
  }

  const didLogin = await authStore.login({
    account: form.account.trim(),
    password: form.password,
  })

  if (!didLogin) {
    return
  }

  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : '/'

  await router.replace(redirectTarget)
}
</script>

<template>
  <div class="qq9-login-page">
    <q-q-wave-background />

    <main class="qq9-login-shell">
      <section class="qq9-login-card">
        <div class="qq9-login-card__head">
          <div class="qq9-window-dots">
            <span class="qq9-window-dot"></span>
            <span class="qq9-window-dot"></span>
            <span class="qq9-window-dot"></span>
          </div>
          <h1>QQ 登录</h1>
          <p>账号密码登录</p>
        </div>

        <form
          class="qq9-login-form"
          @submit.prevent="handleSubmit"
        >
          <label class="qq9-login-field">
            <span>账号</span>
            <input
              v-model="form.account"
              type="text"
              autocomplete="username"
              placeholder="请输入账号"
            />
          </label>

          <label class="qq9-login-field">
            <span>密码</span>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </label>

          <p
            v-if="surfaceErrorMessage"
            class="qq9-login-form__error"
          >
            {{ surfaceErrorMessage }}
          </p>

          <button
            class="qq9-login-form__submit"
            type="submit"
            :disabled="!canSubmit"
          >
            {{ authStore.status === 'submitting' ? '正在登录...' : '登录' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.qq9-login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #dde5f4;
}

.qq9-login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.qq9-login-card {
  width: min(380px, 100%);
  padding: 28px 24px 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(22px);
  box-shadow: 0 24px 72px rgba(79, 102, 148, 0.15);
}

.qq9-login-card__head {
  h1,
  p {
    margin: 0;
  }

  h1 {
    margin-top: 20px;
    color: #1f2430;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  p {
    margin-top: 8px;
    color: #6d7690;
    font-size: 14px;
    line-height: 1.5;
  }
}

.qq9-login-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qq9-login-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    color: #334155;
    font-size: 13px;
    font-weight: 600;
  }

  input {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border: 1px solid rgba(147, 169, 207, 0.34);
    border-radius: 16px;
    background: rgba(248, 250, 254, 0.92);
    color: #1f2430;
    font-size: 15px;
    outline: none;
    transition:
      border-color 140ms ease,
      box-shadow 140ms ease,
      background-color 140ms ease;

    &:focus {
      border-color: rgba(47, 134, 239, 0.56);
      box-shadow: 0 0 0 4px rgba(47, 134, 239, 0.12);
      background: #fff;
    }

    &::placeholder {
      color: #98a2b3;
    }
  }
}

.qq9-login-form__error {
  margin: -2px 2px 0;
  color: #d84b5b;
  font-size: 13px;
  line-height: 1.5;
}

.qq9-login-form__submit {
  margin-top: 2px;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #3b95ff 0%, #2f86ef 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    opacity 140ms ease;
  box-shadow: 0 18px 36px rgba(47, 134, 239, 0.22);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 22px 42px rgba(47, 134, 239, 0.28);
  }

  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
    box-shadow: none;
  }
}

@media (max-width: 640px) {
  .qq9-login-page {
    padding: 16px;
  }

  .qq9-login-card {
    width: min(100%, 360px);
    padding: 24px 18px 20px;
    border-radius: 24px;
  }

  .qq9-login-card__head h1 {
    font-size: 26px;
  }
}
</style>
