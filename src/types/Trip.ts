// 行程相关类型
export interface Trip {
  // UUID 类型用 string 表示（数据库 gen_random_uuid() 生成的字符串）
  id: string
  user_id: string
  trip_date: string // 日期类型用 string（ISO 格式：'YYYY-MM-DD'）
  time_slot: string // 时间段文本（如 '09:00-11:00'）
  tracking_number: string // 追踪编号
  empl_id: string // 关联 employees 表的主键（UUID 字符串）
  start_location: string // 出发地
  end_location: string // 目的地
  distance: number // 距离（DECIMAL 对应 TS number）
  highway_fee: number // 高速费
  parking_fee: number // 停车费
  other_fees: number // 其他费用
  remarks?: string // 备注（可选字段，数据库允许 NULL）
  is_deleted: boolean // 软删除标记
  deleted_at?: string | null // 软删除时间（UTC 时间字符串，可选）
  created_at: string // 创建时间（UTC 时间字符串：'YYYY-MM-DDTHH:mm:ssZ'）
  updated_at: string // 更新时间（同上）
  trip_expand?: TripExpand // 行程扩展信息（可选字段）
  [key: string]: unknown
}
// install_fee,handling_fee,freight_fee,other_fee,
export interface TripExpand {
  install_fee: number // 安装费
  handling_fee: number // 处理费
  freight_fee: number // 运输费
  other_fee: number // 其他费
  is_calculate: boolean // 是否已核算
}
