import type { ResponseCode } from './responseCode'

/**
 * 错误通知接口
 */
export interface ErrorNotice {
  /** 错误码 */
  code: ResponseCode | number
  /** 错误信息 */
  msg: any
  /** 自定义错误信息，用于展示给用户 */
  customMsg?: string
  /** 错误来源，用于定位错误发生的位置 */
  from: string
}

export interface ServiceError {
  code: number // 错误码
  msg: string // 错误信息
  error_code: string // 服务端 错误字符码，用于和服务端错误码对应
}
