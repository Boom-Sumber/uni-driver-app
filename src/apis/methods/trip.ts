import type { ErrorNotice } from '@/types/error'
import type { Trip } from '@/types/trip'
import { dayjs } from 'wot-design-uni'
import { getStorage, setStorage } from '@/utils/storage'
import { supabaseClient } from '../supabase'

/**
 * 获取指定行程
 * @param tripId 行程ID
 * @returns 行程详情
 */
export async function getTripById(tripId: string): Promise<Trip | null> {
  try {
    const { data, error } = await supabaseClient.from('trips').select().eq('id', tripId).single()
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return data as Trip ?? null
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `获取行程详情失败`,
      from: 'getTripById',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 按日期范围查询行程
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 行程列表
 */
export async function searchTripsByDateRange(startDate: string, endDate: string): Promise<Trip[]> {
  try {
    const trips = getStorage(`trip_${startDate}_${endDate}`) as Trip[]
    if (trips) {
      return trips
    }

    const { data, error } = await supabaseClient.from('trips').select('*,trips_expand!inner(install_fee,handling_fee,freight_fee,other_fee,is_calculate)').gte('trip_date', startDate).lte('trip_date', endDate)
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    const sortedTrips = sortTrips(data)
    const cacheExpire = dayjs().endOf('day').valueOf()
    setStorage(`trip_${startDate}_${endDate}`, sortedTrips, cacheExpire)
    return sortedTrips
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `按日期范围查询行程列表失败`,
      from: 'searchTripsByDateRange',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 新增行程
 * @param insertData 行程数据
 * @returns 新增行程详情
 */
export async function addTrip(insertData: any): Promise<Trip> {
  try {
    const { data, error } = await supabaseClient.from('trips').insert(insertData).select().single()
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return data as Trip
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `新增行程失败`,
      from: 'addTrip',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 更新行程
 * @param updateData 行程数据
 * @param id 行程ID
 * @returns 更新行程详情
 */
export async function editTrip(updateData: any, id: string): Promise<Trip> {
  try {
    const { data, error } = await supabaseClient.from('trips').update(updateData).eq('id', id).select().single()
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return data as Trip
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `更新行程失败`,
      from: 'editTrip',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 删除行程
 * @param id 行程ID
 * @returns 是否删除成功
 */
export async function deleteTrip(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient.from('trips').update({ is_deleted: true }).eq('id', id)
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return true
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `删除行程失败`,
      from: 'deleteTrip',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}

function sortTrips(trips: Trip[]): Trip[] {
  if (!trips || trips.length === 0) {
    return []
  }
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
