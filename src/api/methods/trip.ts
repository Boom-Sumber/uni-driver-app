import type { ErrorNotice } from '@/types/error'
import type { Trip } from '@/types/trip'
import { ResponseCode } from '@/types/responseCode'
import { addData, getDataById, searchData, updateData } from './commonApi'

const TABLE_NAME = 'trips'

/**
 * 获取指定行程
 * @param tripId 行程ID
 * @returns 行程详情
 */
export async function getTripById(tripId: string) {
  try {
    const config = {
      cacheFor: 'memory',
    }
    return await getDataById<Trip>(TABLE_NAME, tripId, config)
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `获取行程详情失败`
    }
    if (errorNotice.code === ResponseCode.NOT_AUTHORIZED) {
      errorNotice.customMsg = `用户未授权`
    }
    errorNotice.from = 'getTripById'
    throw new Error(JSON.stringify(errorNotice))
  }
}
/**
 * 查询行程
 * @param config 请求配置（包含查询参数[params], 缓存配置[cacheFor], method实例名称[name]等等）
 * @returns 行程列表
 */
export async function searchTrips(config?: Record<string, any> | undefined) {
  try {
    return await searchData<Trip>(TABLE_NAME, config)
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `查询行程列表失败`
    }
    if (errorNotice.code === ResponseCode.NOT_AUTHORIZED) {
      errorNotice.customMsg = `用户未授权`
    }
    errorNotice.from = 'searchTrips'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 新增行程
 * @param data 行程数据
 * @returns 新增行程
 */
export async function addTrip(data: any) {
  try {
    return await addData<Trip>(TABLE_NAME, data)
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `新增行程失败`
    }
    if (errorNotice.code === ResponseCode.NOT_AUTHORIZED) {
      errorNotice.customMsg = `用户未授权`
    }
    errorNotice.from = 'addTrip'
    throw new Error(JSON.stringify(errorNotice))
  }
}

/**
 * 更新行程
 * @param data 行程数据
 * @param id 行程ID
 * @returns 是否更新成功
 */
export async function editTrip(data: any, id: string) {
  try {
    return await updateData<Trip>(TABLE_NAME, data, {
      params: {
        id: `eq.${id}`,
      },
    })
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `更新行程失败`
    }
    if (errorNotice.code === ResponseCode.NOT_AUTHORIZED) {
      errorNotice.customMsg = `用户未授权`
    }
    errorNotice.from = 'editTrip'
    throw new Error(JSON.stringify(errorNotice))
  }
}
