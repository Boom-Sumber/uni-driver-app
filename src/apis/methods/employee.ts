import type { Employee } from '@/types/empl'
import type { ErrorNotice } from '@/types/error'
import { supabaseClient } from '@/apis/supabase'
import { getStorage, setStorage } from '@/utils/storage'

/**
 * 获取所有员工
 * @returns Promise<Employee[]>
 */
export async function getEmployees(): Promise<Employee[]> {
  try {
    const employees = getStorage('empl_list') as Employee[] | null
    if (employees) {
      return employees
    }
    const { data, error } = await supabaseClient.from('employees').select('id,name')
    const cacheExpire = 'infinitely'
    setStorage('empl_list', data ?? [], cacheExpire)
    if (error) {
      throw new Error(JSON.stringify(error))
    }
    return data ?? []
  }
  catch (error) {
    const errMsg = JSON.parse((error as Error).message)
    const errorNotice: ErrorNotice = {
      code: errMsg.status,
      msg: errMsg.data,
      customMsg: `获取所有员工失败`,
      from: 'getEmployees',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}
