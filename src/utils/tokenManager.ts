import type { User } from '@/types/authType'
// src/utils/tokenManager.ts
import { refreshToken } from '@/api/methods/user'

// Token 存储键名
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user'
const LOGIN_STATUS_KEY = 'login_status'
const TOKEN_EXPIRE_AT = 'token_expire_at' // 5分钟过期

/**
 * 存储登录信息
 */
export function setAuthData(accessToken: string, refreshToken: string, user: User, expiresAt: number) {
  uni.setStorageSync(ACCESS_TOKEN_KEY, accessToken)
  uni.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(user))
  uni.setStorageSync(LOGIN_STATUS_KEY, 'logged_in')
  uni.setStorageSync(TOKEN_EXPIRE_AT, expiresAt)
}

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  return uni.getStorageSync(ACCESS_TOKEN_KEY)
}

/**
 * 获取刷新令牌
 */
export function getRefreshToken(): string | null {
  return uni.getStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * 获取用户信息
 */
export function getUserInfo(): any {
  const userStr = uni.getStorageSync(USER_INFO_KEY)
  return userStr ? JSON.parse(userStr) : null
}

/**
 * 获取 token 过期时间
 */
export function getExpireAt(): number | null {
  return uni.getStorageSync(TOKEN_EXPIRE_AT)
}

/**
 * 清除登录信息
 */
export function clearAuthData() {
  uni.removeStorageSync(ACCESS_TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
  uni.removeStorageSync(USER_INFO_KEY)
  uni.setStorageSync(LOGIN_STATUS_KEY, 'logged_out')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  const token = getAccessToken()
  const loginStatus = uni.getStorageSync(LOGIN_STATUS_KEY)
  return !!token && loginStatus === 'logged_in'
}

/**
 * 刷新访问令牌
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
