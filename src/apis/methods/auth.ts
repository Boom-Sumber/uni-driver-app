import type { User, UserMetadata } from 'supabase-wechat-stable-v2'
import type { ErrorNotice } from '@/types/error'
import { AuthError } from 'supabase-wechat-stable-v2'
import { supabaseClient } from '@/apis/supabase'
import { getStorage, removeStorage, setStorage } from '@/utils/storage'

const BASE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

/**
 * 刷新 access token
 * @returns Promise<boolean>
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.auth.refreshSession()
    if (error) {
      throw error
    }
    if (data) {
      setStorage('app_user', data.user, 'infinitely')
      return true
    }
    return false
  }
  catch (error) {
    let errData = {
      code: -1,
      error_code: '设置缓存数据失败',
      msg: '设置缓存数据失败',
    }
    // 判断error 是否是 AuthError 类型
    if ((error instanceof AuthError)) {
      errData = JSON.parse((error as AuthError).message).data
    }
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `刷新失败`,
      from: 'refreshToken',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 获取用户信息
 * @returns Promise<User | null>
 */
export async function getUser(): Promise<User | null> {
  try {
    const user = getStorage('app_user') as User | null
    if (user) {
      return user
    }

    const { data, error } = await supabaseClient.auth.getUser()
    if (error) {
      throw error
    }
    if (data) {
      try {
        setStorage('app_user', data.user, 'infinitely')
      }
      catch (error) {
        console.error('UNI_STORAGE_ERROR', error)
        throw error
      }
      return data.user
    }
    return null
  }
  catch (error) {
    let errData = {
      code: -1,
      error_code: '读取/设置用户信息缓存数据失败',
      msg: '读取/设置用户信息缓存数据失败',
    }
    // 判断error 是否是 AuthError 类型
    if ((error instanceof AuthError)) {
      errData = JSON.parse((error as AuthError).message).data
    }
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `获取用户信息失败`,
      from: 'getUser',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 密码登录
 * @param email 邮箱
 * @param password 密码
 * @returns Promise<boolean>
 */
export async function loginWithPsd(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }
    if (data) {
      try {
        setStorage('app_user', data.user, 'infinitely')
      }
      catch (error) {
        console.error('UNI_STORAGE_ERROR', error)
        throw error
      }
      return true
    }
    return false
  }
  catch (error) {
    let errData = {
      code: -1,
      error_code: '登录失败',
      msg: '登录失败',
    }
    // 判断error 是否是 AuthError 类型
    if ((error instanceof AuthError)) {
      errData = JSON.parse((error as AuthError).message).data
    }
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `登录失败`,
      from: 'loginWithPsd',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 验证码登录/注册---发送验证码
 * @param email 邮箱
 * @returns Promise<boolean>
 */
export async function sendCode(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email,
    })
    if (error) {
      throw error
    }
    return !!data
  }
  catch (error) {
    const errData = JSON.parse((error as AuthError).message).data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `发送验证码失败`,
      from: 'sendCode',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 验证码登录/注册---验证验证码
 * @param email 邮箱
 * @param code 验证码
 * @returns Promise<boolean>
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) {
      throw error
    }
    return true
  }
  catch (error) {
    const errData = JSON.parse((error as AuthError).message).data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `验证验证码失败`,
      from: 'verifyCode',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 更新密码
 * @param password 新密码
 * @returns Promise<boolean>
 */
export async function updatePassword(password: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password,
    })
    if (error) {
      throw error
    }
    await logout()
    return true
  }
  catch (error) {
    const errData = JSON.parse((error as AuthError).message).data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `更新密码失败`,
      from: 'updatePassword',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 注销登录
 * @returns Promise<boolean>
 */
export async function logout(): Promise<boolean> {
  try {
    const { error } = await supabaseClient.auth.signOut()
    if (error) {
      throw error
    }
    removeStorage('app_user')
    removeStorage('initStartApp')
    return true
  }
  catch (error) {
    const errData = JSON.parse((error as AuthError).message).data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `注销登录失败`,
      from: 'logout',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 更新用户元数据
 * @param metadata 元数据
 * @returns Promise<boolean>
 */
export async function updateMetadata(metadata: UserMetadata): Promise<boolean> {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      data: metadata,
    })
    if (error) {
      throw error
    }
    await logout()
    return true
  }
  catch (error) {
    const errData = JSON.parse((error as AuthError).message).data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `更新用户元数据失败`,
      from: 'updateMetadata',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 用户名注册
 * @param username 用户名
 * @param password 密码
 * @returns Promise<boolean>
 */
export async function registerByUsername(username: string, password: string): Promise<boolean> {
  try {
    const response = await supabaseClient.functions.invoke(`${BASE_FUNCTION_URL}/username-register`, {
      method: 'POST',
      body: {
        type: 'username',
        userInfo: {
          username,
          password,
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.error) {
      throw new Error(JSON.stringify(response.error))
    }
    return true
  }
  catch (error) {
    const errData = JSON.parse((error as Error).message).context.data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `用户名注册失败`,
      from: 'registerByUsername',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 账户验证
 * @param account 邮箱或用户名
 * @param type 验证类型，默认邮箱验证
 * @returns Promise<boolean>
 */
export async function verifyAccount(account: string, type = 'email'): Promise<boolean> {
  try {
    const response = await supabaseClient.functions.invoke(`${BASE_FUNCTION_URL}/check`, {
      method: 'POST',
      body: {
        type,
        account,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.error) {
      throw new Error(JSON.stringify(response.error))
    }
    return !!response.data
  }
  catch (error) {
    const errData = JSON.parse((error as Error).message).context.data
    const errorNotice: ErrorNotice = {
      code: errData.code,
      msg: errData,
      customMsg: `账户验证失败`,
      from: 'verifyAccount',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 邮箱注册-发送验证码
 * @param account 邮箱
 * @param type 注册类型，默认邮箱注册
 * @returns Promise<boolean>
 */
export async function sendVerifyCode(account: string, type = 'email'): Promise<boolean> {
  // eslint-disable-next-line no-useless-catch
  try {
    const isChecked = await verifyAccount(account, type)
    if (isChecked) {
      return await sendCode(account)
    }
    return false
  }
  catch (error) {
    throw error
  }
}
