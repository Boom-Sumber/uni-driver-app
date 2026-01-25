import pinia from '@/stores'
import { useCacheVersionStore } from '@/stores/cacheVersion'
/**
 * 带有效期的本地缓存工具（基于 uni.setStorageSync/uni.getStorageSync）
 * @author 自定义
 */

const cacheVersionStore = useCacheVersionStore(pinia)
/**
 * 设置带有效期的缓存
 * @param {string} key 缓存键名
 * @param {Any} data 要缓存的原始数据
 * @param {number} expireAt 过期时间（毫秒级时间戳）
 */
export function setStorage(key: string, data: any, expireAt: number | 'infinitely'): void {
  if (!key) {
    console.error('缓存键名不能为空')
    return
  }
  // 封装缓存对象：包含原始数据 + 过期时间戳 + 缓存版本
  const cacheObj = {
    data, // 原始数据
    expireAt: expireAt === 'infinitely' ? new Date('2099-12-31 23:39:59').getTime() : expireAt, // 过期时间（毫秒级时间戳）
    version: cacheVersionStore.generateCacheKey(key), // 缓存版本
  }
  // 存入缓存
  uni.setStorageSync(key, cacheObj)
}

/**
 * 读取带有效期的缓存
 * @param {string} key 缓存键名
 * @param {string} tag 缓存版本，用于判断是否需要刷新缓存
 * @returns {Any} 未过期返回原始数据，过期/不存在返回 null
 */
export function getStorage(key: string): any | null {
  if (!key) {
    console.error('缓存键名不能为空')
    return null
  }
  try {
    // 读取缓存
    const cacheObj = uni.getStorageSync(key)
    if (!cacheObj) {
      return null
    }

    // 解析缓存对象
    const now = Date.now()

    // 校验是否过期
    if (now > cacheObj.expireAt) {
      // 过期则删除缓存
      uni.removeStorageSync(key)
      return null
    }
    // 校验缓存版本是否匹配
    if (cacheObj.version !== cacheVersionStore.generateCacheKey(key)) {
      // 缓存版本不匹配则删除缓存
      uni.removeStorageSync(key)
      return null
    }

    // 未过期返回原始数据
    return cacheObj.data
  }
  catch (error) {
    console.error('读取缓存失败：', error)
    // 读取异常时删除该缓存
    uni.removeStorageSync(key)
    return null
  }
}

/**
 * 删除指定缓存
 * @param {string} key 缓存键名
 */
export function removeStorage(key: string): void {
  if (key) {
    uni.removeStorageSync(key)
    cacheVersionStore.deleteVersion(key)
  }
}

/**
 * 清空所有缓存
 */
export function clearAllStorage() {
  uni.clearStorageSync()
}

/**
 * 删除指定前缀key的缓存
 * @param {string} prefixKey 缓存键名前缀字符串
 */
export function removeStorageWithPrefixKey(prefixKey: string): void {
  if (prefixKey) {
    const keys = uni.getStorageInfoSync().keys
    keys.forEach((key) => {
      if (key.startsWith(prefixKey)) {
        uni.removeStorageSync(key)
      }
    })
  }
}
