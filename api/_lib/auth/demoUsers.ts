import type { AuthUserProfile } from '../../../src/types/auth'

export interface DemoAuthRecord extends AuthUserProfile {
  account: string
  password: string
  enabled: boolean
}

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} environment variable is required`)
  }
  return value
}

let _demoUsers: DemoAuthRecord[] | null = null

const getDemoUsers = (): DemoAuthRecord[] => {
  if (!_demoUsers) {
    _demoUsers = [
      {
        userId: 'demo001',
        account: requireEnv('DEMO_LOGIN_ACCOUNT'),
        password: requireEnv('DEMO_LOGIN_PASSWORD'),
        qqNumber: requireEnv('DEMO_LOGIN_QQ'),
        displayName: requireEnv('DEMO_LOGIN_NAME'),
        avatar: {
          kind: 'image',
          imageKey: 'avatar-1',
        },
        online: true,
        enabled: true,
      },
    ]
  }
  return _demoUsers
}

export const sanitizeDemoUser = (
  user: DemoAuthRecord
): AuthUserProfile => ({
  userId: user.userId,
  qqNumber: user.qqNumber,
  displayName: user.displayName,
  avatar: user.avatar,
  online: user.online,
})

export const findDemoUserByAccount = (account: string) =>
  getDemoUsers().find(
    (user) => user.enabled && user.account.toLowerCase() === account.toLowerCase()
  )

export const findDemoUserById = (userId: string) =>
  getDemoUsers().find((user) => user.enabled && user.userId === userId)
