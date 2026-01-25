import { defineStore } from 'pinia'

// 定义状态类型：key 是基础条件字符串（如'2025-12-03'），value 是对应的版本号
interface CacheVersionState {
  versionMap: Record<string, number> // 基础KEY -> 版本号的映射
}

/**
 * 缓存版本号管理 Store
 * 核心能力：管理不同基础KEY的版本号、生成带版本的缓存KEY、版本升级/重置等
 */
export const useCacheVersionStore = defineStore('cacheVersion', {
  // 初始状态
  state: (): CacheVersionState => ({
    versionMap: {}, // 初始为空，动态添加
  }),

  // 计算属性（辅助方法）
  getters: {
    /**
     * 获取指定基础KEY的当前版本号（自动初始化）
     * @param state 状态
     * @returns 版本号获取函数
     */
    getCurrentVersion: state => (baseKey: string): number => {
      // 核心修复：如果不存在，先初始化版本号为1（通过action）
      if (!state.versionMap[baseKey]) {
        useCacheVersionStore().initVersion(baseKey)
      }
      return state.versionMap[baseKey]
    },

    /**
     * 生成带版本号的完整缓存KEY（自动初始化版本号）
     * @param _state 状态
     * @returns 缓存KEY生成函数
     */
    generateCacheKey: _state => (baseKey: string): string => {
      // 先确保版本号已初始化
      const version = useCacheVersionStore().getCurrentVersion(baseKey)
      return `${baseKey}_v${version}`
    },
  },

  // 方法（核心操作）
  actions: {
    /**
     * 初始化指定基础KEY的版本号（不存在则设为1）
     * @param baseKey 基础条件字符串
     */
    initVersion(baseKey: string): void {
      if (!this.versionMap[baseKey]) {
        this.versionMap[baseKey] = 1
      }
    },

    /**
     * 升级指定基础KEY的版本号（+1）
     * @param baseKey 基础条件字符串
     */
    upgradeVersion(baseKey: string): void {
      // 先初始化（防止未生成过的KEY直接升级）
      this.initVersion(baseKey)
      this.versionMap[baseKey] += 1
    },

    /**
     * 重置指定基础KEY的版本号为1
     * @param baseKey 基础条件字符串
     */
    resetVersion(baseKey: string): void {
      this.versionMap[baseKey] = 1
    },

    /**
     * 批量重置版本号
     * @param baseKeys 基础KEY数组（不传则重置所有）
     */
    batchResetVersion(baseKeys?: string[]): void {
      if (baseKeys?.length) {
        baseKeys.forEach(key => this.resetVersion(key))
      }
      else {
        Object.keys(this.versionMap).forEach(key => this.resetVersion(key))
      }
    },

    /**
     * 删除指定基础KEY的版本号记录
     * @param baseKey 基础条件字符串
     */
    deleteVersion(baseKey: string): void {
      delete this.versionMap[baseKey]
    },

    /**
     * 清空所有版本号记录
     */
    clearAllVersion(): void {
      this.versionMap = {}
    },
  },
  persist: {
    key: 'cache_version_store',
    storage: {
      getItem: (key: string) => uni.getStorageSync(key),
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
    },
    pick: ['versionMap'],
    serializer: {
      deserialize: JSON.parse,
      serialize: JSON.stringify,
    },
  },
})
