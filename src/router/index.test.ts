import {
  describe,
  expect,
  it,
} from 'vitest'
import { resolveAuthRedirect } from './index'

describe('resolveAuthRedirect', () => {
  it('redirects anonymous visitors away from auth-protected routes', () => {
    const redirect = resolveAuthRedirect(
      {
        fullPath: '/',
        meta: {
          requiresAuth: true,
        },
      },
      false
    )

    expect(redirect).toEqual({
      name: 'QQLogin',
      query: undefined,
    })
  })

  it('sends authenticated users away from the login page', () => {
    const redirect = resolveAuthRedirect(
      {
        fullPath: '/login',
        meta: {
          guestOnly: true,
        },
      },
      true
    )

    expect(redirect).toEqual({
      name: 'QQ9Home',
    })
  })
})
