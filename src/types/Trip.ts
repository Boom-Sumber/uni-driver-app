/**
 * 行程相关类型
 */
export interface Trip {
  /**
   * 行程ID
   */
  id: string
  /**
   * 用户ID
   */
  user_id: string
  /**
   * 行程日期
   */
  trip_date: string
  /**
   * 行程时间段
   */
  time_slot: string
  /**
   * 跟踪编号
   */
  tracking_number: string
  /**
   * 员工ID
   */
  empl_id: string
  /**
   * 出发地
   */
  start_location: string
  /**
   * 目的地
   */
  end_location: string
  /**
   * 距离（km）
   */
  distance: number
  /**
   * 高速费（元）
   */
  highway_fee: number
  /**
   * 停车费（元）
   */
  parking_fee: number
  /**
   * 其他费用（元）
   */
  other_fees: number
  /**
   * 备注
   */
  remarks?: string
  /**
   * 软删除标记
   */
  is_deleted: boolean
  /**
   * 软删除时间（UTC 时间字符串，可选）
   */
  deleted_at?: string | null
  /**
   * 创建时间（UTC 时间字符串：'YYYY-MM-DDTHH:mm:ssZ'）
   */
  created_at: string
  /**
   * 更新时间（同上）
   */
  updated_at: string
  /**
   * 行程扩展信息（可选字段）
   */
  trips_expand?: TripExpand
  [key: string]: unknown
}
/**
 * 行程扩展信息
 */
export interface TripExpand {
  /**
   * 安装费（元）
   */
  install_fee: number
  /**
   * 上货费（元）
   */
  handling_fee: number
  /**
   * 运输费（元）
   */
  freight_fee: number
  /**
   * 其他费（元）
   */
  other_fee: number
  /**
   * 是否已核算
   */
  is_calculate: boolean
}

export interface DateRange {
  startDate: string
  endDate: string
}
