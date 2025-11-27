import type { Trip } from '@/types/Trip'
import { alovaGet, alovaPost, alovaPut } from '../index'

const BASE_TRIP_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`

/**
 * 获取全部行程
 * @returns 行程列表
 */
export async function getAllTrips() {
  try {
    const response = await alovaGet(`${BASE_TRIP_URL}/trips`, {
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return response as Trip[]
    }
  }
  catch (error) {
    const errorMsg = `执行: getTrips 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 获取指定行程
 * @param tripId 行程ID
 * @returns 行程详情
 */
export async function getTripById(tripId: string) {
  try {
    const response = await alovaGet(`${BASE_TRIP_URL}/trips/${tripId}`, {
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return response as Trip
    }
  }
  catch (error) {
    const errorMsg = `执行: getTripById 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}
/**
 * 按条件查询行程
 * @param params 查询参数
 * @returns 行程列表
 */
export async function searchTrips(params: any) {
  try {
    const response = await alovaGet(`${BASE_TRIP_URL}/trips`, {
      meta: {
        ignoreToken: false,
      },
      params,
    }) as any
    if (response) {
      return response as Trip[]
    }
  }
  catch (error) {
    const errorMsg = `执行: searchTrips 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}
