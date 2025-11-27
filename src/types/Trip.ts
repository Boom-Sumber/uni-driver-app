// 行程相关类型
export interface Trip {
  id: string
  user_id: string
  trip_date: string
  time_slot: string
  tracking_number: string
  coordinator: string
  start_location: string
  end_location: string
  distance: number
  highway_fee: number
  parking_fee: number
  other_fees: number
  remarks: string | null
}
