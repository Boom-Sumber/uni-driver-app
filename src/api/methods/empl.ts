import type { Employee } from '@/types/empl'
import type { ErrorNotice } from '@/types/error'
import pinia from '@/stores'
import { useCacheVersionStore } from '@/stores/cacheVersion'
import { ResponseCode } from '@/types/responseCode'
import { getAllData } from './commonApi'

const TABLE_NAME = 'employees'

/**
 * 获取全部员工
 * @returns 员工列表
 */
export async function getEmployees() {
  const cacheVersion = useCacheVersionStore(pinia)
  const employeeCacheVersion = cacheVersion.generateCacheKey('employee')
  const config = {
    params: {
      select: 'id,name',
    },
    cacheFor: {
      // 设置缓存模式为持久化模式
      mode: 'restore',
      // 设置缓存时间为无限长
      expire: 'infinity',
      // 设置缓存标签为员工缓存版本
      tag: employeeCacheVersion,
    },
  }
  try {
    return await getAllData<Employee>(TABLE_NAME, config)
  }
  catch (error) {
    const errorNotice: ErrorNotice = JSON.parse((error as Error).message)
    if (errorNotice.code !== ResponseCode.REQUEST_TIMEOUT) {
      errorNotice.customMsg = `获取员工列表失败`
    }
    if (errorNotice.code === ResponseCode.NOT_AUTHORIZED) {
      errorNotice.customMsg = `用户未授权`
    }
    errorNotice.from = 'getEmployees'
    throw new Error(JSON.stringify(errorNotice))
  }
}
