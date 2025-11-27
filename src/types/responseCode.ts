// 定义响应码枚举
export enum ResponseCode {
  SUCCESS = 200,
  INVALID_REQUEST = 400,
  INVALID_JWT = 401,
  NOT_AUTHORIZED = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_ERROR = 500,
}
// 定义响应消息映射
export const ResponseMessage: Record<ResponseCode, string> = {
  [ResponseCode.SUCCESS]: '操作成功',
  [ResponseCode.INVALID_REQUEST]: '请求参数错误',
  [ResponseCode.INVALID_JWT]: '未授权访问',
  [ResponseCode.NOT_AUTHORIZED]: '禁止访问',
  [ResponseCode.NOT_FOUND]: '资源不存在',
  [ResponseCode.REQUEST_TIMEOUT]: '请求超时',
  [ResponseCode.TOO_MANY_REQUESTS]: '请求频率过快',
  [ResponseCode.INTERNAL_ERROR]: '服务器内部错误',
}

export interface errorNotice {
  code: ResponseCode
  msg: string
  from: string
}
