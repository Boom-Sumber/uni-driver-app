import type { User } from '@/types/authType'
// src/stores/authStore.ts
import { defineStore } from 'pinia'
import { getUser } from '@/api/methods/user'
import {
  clearAuthData,
  getAccessToken,
  getExpireAt,
  getRefreshToken,
  getUserInfo,
  isLoggedIn,
  isTokenExpiringSoon,
  refreshAccessToken,
  setAuthData,
} from '@/utils/tokenManager'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    user: getUserInfo(),
    expireAt: getExpireAt(),
    isAuthenticated: isLoggedIn(),
    isLoading: false,
  }),

  actions: {
    /**
     * 设置认证信息
     */
    setAuth(accessToken: string, refreshToken: string, user: User, expiresAt: number) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user
      this.expireAt = expiresAt
      this.isAuthenticated = true
      setAuthData(accessToken, refreshToken, user, expiresAt)
    },

    /**
     * 清除认证信息
     */
    clearAuth() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.expireAt = null
      this.isAuthenticated = false
      clearAuthData()
    },

    /**
     * 初始化认证状态 - 应用启动时调用
     */
    async initAuth(): Promise<boolean> {
      // 如果没有登录状态，直接返回
      if (!isLoggedIn()) {
        return false
      }

      try {
        this.isLoading = true

        // 检查 token 是否需要刷新
        if (isTokenExpiringSoon() && this.refreshToken) {
          console.warn('Token 即将过期，尝试刷新...')
          const success = await refreshAccessToken()
          if (!success) {
            console.warn('Token 刷新失败，清除登录状态')
            this.clearAuth()
            return false
          }

          // 刷新成功后更新 store 状态
          this.accessToken = getAccessToken()
          this.refreshToken = getRefreshToken()
          this.expireAt = getExpireAt()
          this.user = getUserInfo()
        }

        // 验证用户信息（可选，如果需要确保用户信息最新）
        if (this.accessToken) {
          try {
            const userData = await getUser()
            this.user = userData
            setAuthData(this.accessToken, this.refreshToken!, this.user, this.expireAt!)
          }
          catch (error) {
            console.warn('获取用户信息失败，使用缓存信息:', error)
          }
        }

        console.warn('自动登录成功')
        return true
      }
      catch (error) {
        console.error('初始化认证状态失败:', error)
        this.clearAuth()
        return false
      }
      finally {
        this.isLoading = false
      }
    },

  },
})
