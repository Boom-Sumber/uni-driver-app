import type { ErrorNotice, ServiceError } from '@/types/error'
// import type { UniappRequestAdapter } from '@alova/adapter-uniapp'
// import type vueHook from 'alova/vue'
import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
// import { createClientTokenAuthentication } from 'alova/client'
import { ResponseCode } from '@/types/responseCode'
import { getAccessToken, isLoggedIn, refreshAccessToken } from '@/utils/tokenManager'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const alovaInst = createAlova({
  baseURL: supabaseUrl,
  timeout: 15000,
  ...AdapterUniapp(),
  beforeRequest: async (method) => {
    method.config.headers.apikey = supabaseKey
    const { isSignedIn, expireAt } = isLoggedIn()
    if (!method.meta?.ignoreToken) {
      if (!isSignedIn) {
        try {
          if (expireAt < 0) {
            const error: ErrorNotice = {
              code: ResponseCode.NOT_AUTHORIZED,
              msg: {
                stringCode: 'NOT_AUTHORIZED',
                codeMsg: '未登录',
              },
              customMsg: '请先登录',
              from: 'beforeRequest',
            }
            throw new Error(JSON.stringify(error))
          }
          const isSuccess = await refreshAccessToken()
          if (!isSuccess) {
            const error: ErrorNotice = {
              code: ResponseCode.NOT_AUTHORIZED,
              msg: {
                stringCode: 'NOT_AUTHORIZED',
                codeMsg: '登录过期',
              },
              customMsg: '请重新登录',
              from: 'beforeRequest',
            }
            throw new Error(JSON.stringify(error))
          }
        }
        catch (error) {
          throw new Error(error instanceof Error ? error.message : String(error))
        }
      }
      method.config.headers.Authorization = `Bearer ${getAccessToken()}`
    }
  },
  responded: {
    onSuccess: (response) => {
      const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult

      // 检查响应状态码是否为200, 201, 204
      if (statusCode >= 200 && statusCode < 300) {
        return data
      }
      const errorData = data as ServiceError
      // 根据错误状态码抛出异常
      const errorMsg = errorData.msg
      const errorNotice: ErrorNotice = {
        code: errorData.code as ResponseCode | number,
        msg: {
          stringCode: errorData.error_code,
          codeMsg: errorMsg,
        },
        customMsg: '',
        from: '',
      }
      throw new Error(JSON.stringify(errorNotice))
    },
    onError() {
      const errorNotice: ErrorNotice = {
        code: ResponseCode.REQUEST_TIMEOUT,
        msg: {
          stringCode: 'REQUEST_TIMEOUT',
          codeMsg: '请求超时或连接中断',
        },
        customMsg: '网络连接异常',
        from: '',
      }
      throw new Error(JSON.stringify(errorNotice))
    },
  },

})

/**
 * 发送 GET 请求
 * @param url 请求 URL
 * @param config 请求配置
 * @returns Promise<any>
 */
export const alovaGet = (url: string, config?: Record<string, any>) => alovaInst.Get(url, config)

/**
 * 发送 POST 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<any>
 */
export const alovaPost = (url: string, data?: Record<string, any>, config?: Record<string, any>) => alovaInst.Post(url, data, config)

/**
 * 发送 PUT 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<any>
 */
export const alovaPut = (url: string, data?: Record<string, any>, config?: Record<string, any>) => alovaInst.Put(url, data, config)

/**
 * 发送 DELETE 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<any>
 */
export const alovaDelete = (url: string, data?: Record<string, any>, config?: Record<string, any>) => alovaInst.Delete(url, data, config)

/**
 * 发送 PATCH 请求
 * @param url 请求 URL
 * @param data 请求数据
 * @param config 请求配置
 * @returns Promise<any>
 */
export const alovaPatch = (url: string, data?: Record<string, any>, config?: Record<string, any>) => alovaInst.Patch(url, data, config)
