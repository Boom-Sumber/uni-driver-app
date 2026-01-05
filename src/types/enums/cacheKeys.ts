/**
 * 缓存 KEY 枚举：统一管理所有缓存名称和对应的版本号存储 KEY
 */
export enum CacheKeyEnum {
  // 缓存数据 KEY（如 trip_cache、empl_cache）
  TRIP_CACHE = 'trip_cache',
  EMPL_CACHE = 'empl_cache',
  // 可扩展其他缓存：如 ORDER_CACHE = 'order_cache'

  // 版本号存储 KEY（与缓存数据 KEY 对应，格式：${缓存KEY}_version）
  TRIP_CACHE_VERSION = 'trip_cache_version',
  EMPL_CACHE_VERSION = 'empl_cache_version',
  // 可扩展：ORDER_CACHE_VERSION = 'order_cache_version'
}

/**
 * 辅助函数：通过缓存数据 KEY 获取对应的版本号 KEY
 * @param cacheKey 缓存数据 KEY（如 CacheKeyEnum.TRIP_CACHE）
 * @returns 版本号 KEY（如 CacheKeyEnum.TRIP_CACHE_VERSION）
 */
export function getVersionKeyByCacheKey(cacheKey: CacheKeyEnum): CacheKeyEnum {
  switch (cacheKey) {
    case CacheKeyEnum.TRIP_CACHE:
      return CacheKeyEnum.TRIP_CACHE_VERSION
    case CacheKeyEnum.EMPL_CACHE:
      return CacheKeyEnum.EMPL_CACHE_VERSION
    // 新增缓存时，只需添加对应的 case
    // case CacheKeyEnum.ORDER_CACHE:
    //   return CacheKeyEnum.ORDER_CACHE_VERSION
    default:
      throw new Error(`未找到缓存 ${cacheKey} 对应的版本号 KEY，请在 CacheKeyEnum 中配置`)
  }
}

/**
 * 所有缓存数据 KEY 集合（用于初始化时批量加载）
 */
export const CACHE_DATA_KEYS = [
  CacheKeyEnum.TRIP_CACHE,
  CacheKeyEnum.EMPL_CACHE,
  // 新增缓存时，添加到这里
] as const
