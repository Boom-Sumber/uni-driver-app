// 定义响应码枚举
export enum ResponseCode {
  SUCCESS = 200,
  CREATED = 201,
  UPDATED = 204,
  INVALID_REQUEST = 400,
  INVALID_JWT = 401,
  NOT_AUTHORIZED = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_ERROR = 500,
}
/**
 * 定义用户名注册错误响应消息映射
 */
export const ResponseMessage: Record<string, string> = {
  invalid_parameter_t: '客户端请求参数类型错误',
  missing_parameters: '客户端请求参数缺失',
  missing_userinfo: '客户端请求用户信息缺失',
  invalid_username_e: '用户名不能使用电子邮件，也不能包含 “@” 符号',
  invalid_username_c: '用户名不能包含中文字符',
  weak_password: '密码必须大于等于 6 个字符',
  username_exists: '用户名已存在',
  email_exists: '电子邮件已存在',
}
