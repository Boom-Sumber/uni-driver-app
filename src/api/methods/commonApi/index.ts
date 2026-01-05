import { alovaGet, alovaPatch, alovaPost } from '@/api/index'

const BASE_COMMON_URL = `/rest/v1`
/**
 * 新增数据
 * @param table 表名
 * @param data 新增数据
 * @returns 新增数据
 */
export async function addData<T>(table: string, data: Partial<T>, config?: Record<string, any> | undefined) {
  try {
    const response = await alovaPost(`${BASE_COMMON_URL}/${table}`, data, {
      ...config,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Prefer': 'return=representation',
      },
      meta: {
        ignoreToken: false,
      },
    }) as T[]
    if (response) {
      return Array.isArray(response) && response.length > 0 ? response[0] : response as T
    }
    return null as T
  }
  catch (error) {
    const errorMsg = `执行: addData 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 修改数据
 * @param table 表名
 * @param data 修改数据
 * @param config 配置项
 * @returns 修改数据
 */
export async function updateData<T>(table: string, data: Partial<T>, config?: Record<string, any> | undefined): Promise<T | null> {
  try {
    const response = await alovaPatch(`${BASE_COMMON_URL}/${table}`, data, {
      ...config,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Prefer': 'return=representation',
      },
      meta: {
        ignoreToken: false,
      },
    }) as T[]
    if (response) {
      return Array.isArray(response) && response.length > 0 ? response[0] : response as T
    }
    return null as T
  }
  catch (error) {
    const errorMsg = `执行: updateData 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 获取全部数据
 * @param table 表名
 * @returns 数据列表
 */
export async function getAllData<T>(table: string, config?: Record<string, any> | undefined) {
  try {
    const response = await alovaGet(`${BASE_COMMON_URL}/${table}`, {
      ...config,
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      console.warn('getAllData response:', response)
      return response as T[]
    }
    return [] as T[]
  }
  catch (error) {
    const errorMsg = `执行: getAllData 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 按条件查询数据
 * @param table 表名
 * @param config 配置项
 * @returns 数据列表
 */
export async function searchData<T>(table: string, config?: Record<string, any> | undefined) {
  try {
    const response = await alovaGet(`${BASE_COMMON_URL}/${table}`, {
      ...config,
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return response as T[]
    }
    return [] as T[]
  }
  catch (error) {
    const errorMsg = `执行: searchData 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}

/**
 * 获取指定数据
 * @param table 表名
 * @param id 数据ID
 * @returns 数据详情
 */
export async function getDataById<T>(table: string, id: string, config?: Record<string, any> | undefined) {
  try {
    const response = await alovaGet(`${BASE_COMMON_URL}/${table}/${id}`, {
      ...config,
      meta: {
        ignoreToken: false,
      },
    }) as any
    if (response) {
      return response as T
    }
    return null as T
  }
  catch (error) {
    const errorMsg = `执行: getDataById 时异常  : ${(error as Error).message}`
    throw new Error(errorMsg)
  }
}
