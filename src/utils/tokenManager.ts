import type { User } from '@/types/authType'
// src/utils/tokenManager.ts
import { refreshToken } from '@/api/methods/user'

// Token 存储键名
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user'
const LOGIN_STATUS_KEY = 'login_status'
const TOKEN_EXPIRE_AT = 'token_expire_at' // 过期时间戳

// 常量
const LOGIN_IN = import.meta.env.VITE_LOGIN_IN
const LOGIN_OUT = import.meta.env.VITE_LOGIN_OUT

/**
 * 存储登录信息
 */
export function setAuthData(accessToken: string, refreshToken: string, user: User, expiresAt: number) {
  try {
    uni.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
    uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
    uni.setStorageSync(USER_INFO_KEY, JSON.stringify(user))
    uni.setStorageSync(LOGIN_STATUS_KEY, LOGIN_IN)
    uni.setStorageSync(TOKEN_EXPIRE_AT, expiresAt)
  }
  catch (error) {
    console.error('setAuthData 失败:', error)
  }
}

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  try {
    return uni.getStorageSync(ACCESS_TOKEN_KEY)
  }
  catch (error) {
    console.error('getAccessToken 失败:', error)
    return null
  }
}

/**
 * 获取刷新令牌
 */
export function getRefreshToken(): string | null {
  try {
    return uni.getStorageSync(REFRESH_TOKEN_KEY)
  }
  catch (error) {
    console.error('getRefreshToken 失败:', error)
    return null
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo(): User | null {
  try {
    const userStr = uni.getStorageSync(USER_INFO_KEY)
    return userStr ? JSON.parse(userStr) : null
  }
  catch (error) {
    console.error('getUserInfo 失败:', error)
    return null
  }
}

/**
 * 获取 token 过期时间
 */
export function getExpireAt(): number | null {
  try {
    return uni.getStorageSync(TOKEN_EXPIRE_AT)
  }
  catch (error) {
    console.error('getExpireAt 失败:', error)
    return null
  }
}

/**
 * 清除登录信息
 */
export function clearAuthData() {
  try {
    uni.removeStorageSync(ACCESS_TOKEN_KEY)
    uni.removeStorageSync(REFRESH_TOKEN_KEY)
    uni.removeStorageSync(USER_INFO_KEY)
    uni.removeStorageSync(TOKEN_EXPIRE_AT)
    uni.setStorageSync(LOGIN_STATUS_KEY, LOGIN_OUT)
  }
  catch (error) {
    console.error('clearAuthData 失败:', error)
  }
}

/**
 * 检查是否已登录或token是否过期
 * @returns { isSignedIn: boolean, expireAt: number }
 * isSignedIn: 是否已登录
 * expireAt: 过期时间戳
 */
export async function isLoggedIn(): Promise<{ isSignedIn: boolean, expireAt: number }> {
  try {
    const expireAt = getExpireAt() ?? -1
    if (expireAt * 1000 < Date.now()) {
      const b = await refreshAccessToken()
      if (!b) {
        return { isSignedIn: false, expireAt: -1 }
      }
      else {
        return { isSignedIn: true, expireAt: getExpireAt() ?? -1 }
      }
    }
    const token = getAccessToken()
    const loginStatus = uni.getStorageSync(LOGIN_STATUS_KEY)
    const isSignedIn = !!token && loginStatus === LOGIN_IN
    return { isSignedIn, expireAt }
  }
  catch (error) {
    console.error('isLoggedIn 失败:', error)
    return { isSignedIn: false, expireAt: -1 }
  }
}

/**
 * 刷新访问令牌
 * @returns Promise<boolean>
 */
export async function refreshAccessToken() {
  try {
    const currentRefreshToken = getRefreshToken()
    if (!currentRefreshToken) {
      return false
    }

    const result = await refreshToken(currentRefreshToken)
    if (result) {
      setAuthData(
        result.access_token,
        result.refresh_token || currentRefreshToken,
        result.user,
        result.expires_at,
      )
      return true
    }
    // 刷新失败，清除登录状态
    clearAuthData()
    return false
  }
  catch (error) {
    // 刷新失败，清除登录状态
    clearAuthData()
    throw error
  }
}

/**
 * 检查 token 是否即将过期（在过期前5分钟）
 */
export function isTokenExpiringSoon(): boolean {
  const token = getAccessToken()
  if (!token)
    return true

  try {
    // JWT token 的第二部分是 payload，包含过期时间
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // 转换为毫秒
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return exp - now < fiveMinutes
  }
  catch (error) {
    console.error('解析 token 失败:', error)
    return true
  }
}
