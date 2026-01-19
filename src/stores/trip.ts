import type { Trip } from '@/types/trip'
import { defineStore } from 'pinia'
import { dayjs } from 'wot-design-uni'
import { searchTrips } from '@/api/methods/trip'
import pinia from '@/stores'
import { useCacheVersionStore } from './cacheVersion'

const cacheVersionStore = useCacheVersionStore(pinia)

export const useTripStore = defineStore('trip', {
  state: () => ({
    isInit: false,
    trips: new Map<string, Trip[]>(),
  }),
  actions: {
    async initTrips(startDate: string, endDate: string) {
      const trips = await getTrips(startDate, endDate)
      if (trips.length > 0) {
        this.trips.set(`trip_${startDate}_${endDate}`, sortTrips(trips))
      }
      this.isInit = true
    },
    getTrips(startDate: string, endDate: string): Trip[] {
      return this.trips.get(`trip_${startDate}_${endDate}`) ?? []
    },
  },
})

function sortTrips(trips: Trip[]): Trip[] {
  // 创建数组的浅拷贝以避免修改原数组
  return [...trips].sort((a, b) => {
    // 1. 首先按 trip_date 降序排序
    if (a.trip_date > b.trip_date)
      return -1
    if (a.trip_date < b.trip_date)
      return 1

    // 2. trip_date 相同，按 time_slot 起始时间降序排序
    const getStartTime = (timeSlot: string): string => {
      return timeSlot.split('-')[0] // 提取 "HH:MM" 部分
    }

    const startTimeA = getStartTime(a.time_slot)
    const startTimeB = getStartTime(b.time_slot)

    if (startTimeA > startTimeB)
      return -1
    if (startTimeA < startTimeB)
      return 1

    // 3. 如果起始时间也相同，可以继续按其他字段排序或保持原顺序
    return 0
  })
}

async function getTrips(startDate: string, endDate: string) {
  // 异步初始化行程数据,前31天数据
  const cacheExpire = dayjs(new Date().setHours(23, 59, 59, 999)).valueOf()
  const config = {
    // 通过name获取请求的method实例
    params: {
      select: '*,trips_expand(calculate_fee,is_calculate)',
      trip_date: `gte.${startDate}&trip_date=lte.${endDate}`,
    },
    name: `trip_${startDate}_${endDate}`,
    cacheFor: {
      // 设置缓存模式为持久化模式
      mode: 'restore',
      // 设置缓存时间为当天23:59:59.999
      expire: cacheExpire,
      tag: cacheVersionStore.generateCacheKey(`trip_${startDate}_${endDate}`),
    },
  }
  return await searchTrips(config)
}
