import type { Session, User, UserMetadata } from '@/types/authType'
import { useAuthStore } from '@/stores/authStore'
import { getRefreshToken, refreshAccessToken } from '@/utils/tokenManager'
import { alovaGet, alovaPost, alovaPut } from '../index'

/**
 *  auth 接口基础 URL
 */
const BASE_AUTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1`

/**
 * 刷新 access token
 * @param refreshToken  刷新token令牌
 * @returns Promise<Session | undefined>
 */
export async function refreshToken(refreshToken: string) {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/token`, {
      refresh_token: refreshToken,
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
      params: {
        grant_type: 'refresh_token',
      },
    })
    if (response as any) {
      return response as Session
    }
  }
  catch (error) {
    const errorMsg = `执行: refreshToken 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 获取用户信息
 * @returns Promise<User | undefined>
 */
export async function getUser() {
  try {
    const response = await alovaGet(`${BASE_AUTH_URL}/user`, {
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return response as User
    }
  }
  catch (error) {
    const errorMsg = `执行: getUserInfo 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 登录
 * @param email 邮箱
 * @param password 密码
 * @returns Promise<Session | undefined>
 */
export async function loginWithPsd(email: string, password: string) {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/token`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
      params: {
        grant_type: 'password',
      },
    })
    if (response as any) {
      const data = response as Session
      // 登录成功后，更新 authStore 中的用户信息
      const authStore = useAuthStore()
      authStore.setAuth(data.access_token, data.refresh_token, data.user, data.expires_at)
      return data
    }
  }
  catch (error) {
    const errorMsg = `执行: loginWithPsd 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 验证码登录/注册---发送验证码
 * @param email 邮箱
 * @returns Promise<boolean>
 */
export async function sendCode(email: string) {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/otp`, {
      email,
      type: 'email',
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
    }) as any
    if (response) {
      if (!response.data && !response.error) {
        return true
      }
    }
    return false
  }
  catch (error) {
    const errorMsg = `执行: sendCode 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 验证码登录/注册---验证验证码
 * @param email 邮箱
 * @param code 验证码
 * @returns Promise<Session | undefined>
 */
export async function verifyCode(email: string, code: string) {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/verify`, {
      email,
      code,
      type: 'email',
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
    }) as any
    if (response) {
      const data = response as Session
      // 登录成功后，更新 authStore 中的用户信息
      const authStore = useAuthStore()
      authStore.setAuth(data.access_token, data.refresh_token, data.user, data.expires_at)
      return data
    }
  }
  catch (error) {
    const errorMsg = `执行: verifyCode 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 修改密码，  需用户登录状态
 * @param newPassword 新密码
 * @returns Promise<boolean>
 */
export async function updatePassword(newPassword: string) {
  try {
    const response = await alovaPut(`${BASE_AUTH_URL}/user`, {
      password: newPassword,
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return await logout()
    }
    return false
  }
  catch (error) {
    const errorMsg = `执行: updatePassword 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 注销登录
 * @returns Promise<boolean>
 */
export async function logout() {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/logout`, {
      refresh_token: getRefreshToken(),
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      // 注销成功后，清除 authStore 中的用户信息
      const authStore = useAuthStore()
      authStore.clearAuth()
      return true
    }
    return false
  }
  catch (error) {
    const errorMsg = `执行: logout 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 修改用户元数据
 * @param metadata 元数据
 * @returns Promise<boolean>
 */
export async function updateMetadata(metadata: UserMetadata) {
  try {
    const response = await alovaPut(`${BASE_AUTH_URL}/user`, {
      data: metadata,
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return await refreshAccessToken()
    }
    return false
  }
  catch (error) {
    const errorMsg = `执行: updateMetadata 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}
