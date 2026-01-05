/**
 * 认证响应接口
 */
export interface Session {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  expires_at: number
  refresh_token: string
  user: User
}

/**
 * 用户元数据接口
 */
export interface UserMetadata {
  full_name?: string
  user_role?: string
  email_verified?: boolean
}

export interface User {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: Date
  phone: string
  confirmed_at: Date
  last_sign_in_at: Date
  user_metadata: UserMetadata
}

export interface VerifyAccountResponse {
  code: number
  request: string
  available: boolean
  type: string
}
