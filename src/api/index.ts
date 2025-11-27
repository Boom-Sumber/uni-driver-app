import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import { ResponseCode, ResponseMessage } from '@/types/responseCode'
import { getAccessToken, getExpireAt, refreshAccessToken } from '@/utils/tokenManager'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const alovaInst = createAlova({
  baseURL: supabaseUrl,
  timeout: 15000,
  ...AdapterUniapp(),
  beforeRequest: async (method) => {
    method.config.headers.apikey = supabaseKey
    if (!method.meta?.ignoreToken) {
      const expireAt = getExpireAt()
      // 检查 token 是否即将过期, getExpireAt() 为 null 时, 也刷新 token
      if (expireAt === null || expireAt * 1000 < Date.now()) {
        await refreshAccessToken()
      }
      method.config.headers.Authorization = `Bearer ${getAccessToken()}`
    }
  },
  responded: {
    onSuccess: (response) => {
      const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult
      // 检查响应状态码是否为成功
      if (statusCode === ResponseCode.SUCCESS) {
        return data || null
      }
      // 根据错误状态码抛出异常
      const errorMsg = ResponseMessage[statusCode as ResponseCode] || '未知错误'
      throw new Error(errorMsg)
    },
    onError(error) {
      uni.showToast({
        title: '网络连接异常，请重试',
        icon: 'none',
      })
      console.error('请求失败:', error)
      throw error
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
