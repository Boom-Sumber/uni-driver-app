import type { Session, User, UserMetadata, VerifyAccountResponse } from '@/types/authType'
import type { ErrorNotice } from '@/types/error'
import { ResponseCode } from '@/types/responseCode'
import { clearAuthData, getRefreshToken, refreshAccessToken } from '@/utils/tokenManager'
import { alovaGet, alovaPost, alovaPut } from '../index'

/**
 *  auth 接口基础 URL
 */
const BASE_AUTH_URL = `/auth/v1`
const BASE_FUNCTION_URL = `/functions/v1`

/**
 * 刷新 access token
 * @param refreshToken  刷新token令牌
 * @returns Promise<Session | null>
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
    }) as Session
    return response ?? null
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `refresh token 失效`
    }
    errorNotice.from = 'refreshToken'
    throw new Error(JSON.stringify(errorNotice))
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
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `获取用户信息失败`
    }
    errorNotice.from = 'getUser'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 登录
 * @param email 邮箱
 * @param password 密码
 * @returns Promise<Session | null>
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
    }) as Session
    return response ?? null
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `登录失败`
    }
    if (errorNotice.code === ResponseCode.INVALID_REQUEST) {
      errorNotice.customMsg = `登录失败，邮箱或密码错误`
    }
    errorNotice.from = 'loginWithPsd'
    throw new Error(JSON.stringify(errorNotice))
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
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `发送验证码失败`
    }
    errorNotice.from = 'sendCode'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 验证码登录/注册---验证验证码
 * @param email 邮箱
 * @param code 验证码
 * @returns Promise<Session | null>
 */
export async function verifyCode(email: string, code: string) {
  try {
    const response = await alovaPost(`${BASE_AUTH_URL}/verify`, {
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
    }) as Session
    return response ?? null
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `验证验证码失败`
    }
    errorNotice.from = 'verifyCode'
    throw new Error(JSON.stringify(errorNotice))
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
      // 修改完密码必须重新登录
      return await logout()
    }
    return false
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `更新密码失败`
    }
    errorNotice.from = 'updatePassword'
    throw new Error(JSON.stringify(errorNotice))
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
      // 清除登录信息
      clearAuthData()
      return true
    }
    return false
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `注销登录失败`
    }
    errorNotice.from = 'logout'
    throw new Error(JSON.stringify(errorNotice))
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
      // 通过刷新 access token 来更新用户最新信息
      return await refreshAccessToken()
    }
    return false
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `更新用户元数据失败`
    }
    errorNotice.from = 'updateMetadata'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 用户名注册
 * @param username 用户名
 * @param password 密码
 * @returns Promise<boolean>
 */
export async function registerByUsername(username: string, password: string) {
  try {
    const response = await alovaPost(`${BASE_FUNCTION_URL}/username-register`, {
      type: 'username',
      userInfo: {
        username,
        password,
      },
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
    }) as any
    return !!response
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `用户名注册失败`
    }
    errorNotice.from = 'registerByUsername'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 账户验证
 * @param account 邮箱或用户名
 * @param type 验证类型，默认邮箱验证
 * @returns Promise<boolean>
 */
export async function verifyAccount(account: string, type = 'email') {
  try {
    const response = await alovaPost(`${BASE_FUNCTION_URL}/check`, {
      account,
      type,
    }, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      meta: {
        ignoreToken: true,
      },
    }) as VerifyAccountResponse
    return response?.available ?? false
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `账户验证失败`
    }
    errorNotice.from = 'verifyAccount'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 邮箱注册-发送验证码
 * @param account 邮箱
 * @param type 注册类型，默认邮箱注册
 * @returns Promise<boolean>
 */
export async function sendVerifyCode(account: string, type = 'email') {
  try {
    const isChecked = await verifyAccount(account, type)
    if (isChecked) {
      return await sendCode(account)
    }
    return false
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `发送验证码失败`
    }
    errorNotice.from = 'sendVerifyCode'
    throw new Error(JSON.stringify(errorNotice))
  }
}
