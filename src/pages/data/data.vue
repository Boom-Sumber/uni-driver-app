<script setup lang="ts">
import type { CalendarInstance } from 'wot-design-uni/components/wd-calendar/types'
import type { Trip } from '@/types/trip'
import { onLoad, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { dayjs } from 'wot-design-uni'
import { searchTripsByDateRange } from '@/apis/methods/trip'

interface Stats {
  totalRecords: number
  totalDistance: number
  totalHighwayFee: number
  totalParkingFee: number
  totalOutOtherFee: number
  totalInstallFee: number
  totalHandlingFee: number
  totalFreightFee: number
  totalInOtherFee: number
}

const calendarRef = ref<CalendarInstance>()

const dateValue = ref<number>(dayjs().startOf('month').valueOf())

const selectedMonth = ref(dayjs().format('YYYY年MM月'))

const dateRange = ref<number[]>([dayjs().startOf('month').valueOf(), dayjs().endOf('day').valueOf()])

const data = ref<Trip[]>([])

const stats = ref<Stats>({
  totalRecords: 0,
  totalDistance: 0,
  totalHighwayFee: 0,
  totalParkingFee: 0,
  totalOutOtherFee: 0,
  totalInstallFee: 0,
  totalHandlingFee: 0,
  totalFreightFee: 0,
  totalInOtherFee: 0,
})

const totalOutFee = computed(() => {
  return stats.value.totalHighwayFee + stats.value.totalParkingFee + stats.value.totalOutOtherFee
})

const totalInFee = computed(() => {
  return stats.value.totalInOtherFee + stats.value.totalInstallFee + stats.value.totalHandlingFee + stats.value.totalFreightFee
})

onLoad(async () => {
  uni.$on('refreshTripList', async () => {
    await init()
  })
  await init()
})

async function init() {
  try {
    // 初始化数据
    data.value = await searchTripsByDateRange(dayjs(dateRange.value[0]).format('YYYY-MM-DD'), dayjs(dateRange.value[1]).format('YYYY-MM-DD'))
    // 计算统计信息
    handleStats()
  }
  catch (error) {
    console.error('加载行程数据失败:', error)
    throw error
  }
}

// 导航栏按钮点击事件
onNavigationBarButtonTap(async (e) => {
  if (e.index === 0) {
    // da
    calendarRef.value?.open()
  }
})

function handleStats() {
  // 计算统计信息
  stats.value.totalRecords = data.value.length
  stats.value.totalDistance = Number(data.value.reduce((acc, trip) => acc + trip.distance, 0).toFixed(2))
  stats.value.totalHighwayFee = Number(data.value.reduce((acc, trip) => acc + trip.highway_fee, 0).toFixed(2))
  stats.value.totalParkingFee = Number(data.value.reduce((acc, trip) => acc + trip.parking_fee, 0).toFixed(2))
  stats.value.totalOutOtherFee = Number(data.value.reduce((acc, trip) => acc + trip.other_fees, 0).toFixed(2))
  stats.value.totalInstallFee = Number(data.value.reduce((acc, trip) => acc + (trip.trips_expand?.install_fee || 0), 0).toFixed(2))
  stats.value.totalHandlingFee = Number(data.value.reduce((acc, trip) => acc + (trip.trips_expand?.handling_fee || 0), 0).toFixed(2))
  stats.value.totalFreightFee = Number(data.value.reduce((acc, trip) => acc + (trip.trips_expand?.freight_fee || 0), 0).toFixed(2))
  stats.value.totalInOtherFee = Number(data.value.reduce((acc, trip) => acc + (trip.trips_expand?.other_fee || 0), 0).toFixed(2))
}

// 处理日历确认事件
async function handleCalendarconfirm() {
  selectedMonth.value = dayjs(dateValue.value).format('YYYY年MM月')
  // 判断是否是当前月份
  const endDate = dayjs(dateValue.value).isSame(dayjs(), 'month') ? dayjs().endOf('day').valueOf() : dayjs(dateValue.value).endOf('month').valueOf()
  dateRange.value = [dateValue.value, endDate]
  data.value = await searchTripsByDateRange(dayjs(dateRange.value[0]).format('YYYY-MM-DD'), dayjs(dateRange.value[1]).format('YYYY-MM-DD'))
  // 计算统计信息
  handleStats()
  // 处理确认事件
  calendarRef.value?.close()
}
</script>

<template>
  <wd-calendar
    ref="calendarRef"
    v-model="dateValue"
    :max-date="dayjs().endOf('month').valueOf()"
    :with-cell="false"
    type="month"
    @confirm="handleCalendarconfirm"
  />
  <view class="data-center-page">
    <view class="page-content">
      <wd-card :title="`${selectedMonth} 数据统计`">
        <view class="stats-container">
          <view class="stat-card">
            <wd-icon name="list-alt" size="24" color="#1a73e8" />
            <text class="stat-value">
              {{ stats.totalRecords }}
            </text>
            <text class="stat-label">
              总记录数
            </text>
          </view>

          <view class="stat-card">
            <wd-icon name="road" size="24" color="#1a73e8" />
            <text class="stat-value">
              {{ stats.totalDistance }}
            </text>
            <text class="stat-label">
              总里程(km)
            </text>
          </view>
        </view>
      </wd-card>

      <wd-card title="支出费用统计">
        <view class="fee-list">
          <view class="fee-item">
            <text class="fee-label">
              高速费
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalHighwayFee }}元
            </text>
          </view>

          <view class="fee-item">
            <text class="fee-label">
              停车费
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalParkingFee }}元
            </text>
          </view>

          <view class="fee-item">
            <text class="fee-label">
              其他费用
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalOutOtherFee }}元
            </text>
          </view>

          <view class="fee-item total">
            <text class="fee-label">
              总计
            </text>
            <text class="fee-amount total-amount">
              ¥ {{ totalOutFee.toFixed(2) }}元
            </text>
          </view>
        </view>
      </wd-card>

      <wd-card title="结算费用统计">
        <view class="fee-list">
          <view class="fee-item">
            <text class="fee-label">
              安装费
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalInstallFee }}元
            </text>
          </view>

          <view class="fee-item">
            <text class="fee-label">
              上货费
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalHandlingFee }}元
            </text>
          </view>

          <view class="fee-item">
            <text class="fee-label">
              运输费
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalFreightFee }}元
            </text>
          </view>

          <view class="fee-item">
            <text class="fee-label">
              其他费用
            </text>
            <text class="fee-amount">
              ¥ {{ stats.totalInOtherFee }}元
            </text>
          </view>

          <view class="fee-item total">
            <text class="fee-label">
              总计
            </text>
            <text class="fee-amount total-amount">
              ¥ {{ totalInFee.toFixed(2) }}元
            </text>
          </view>
        </view>
      </wd-card>
    </view>
  </view>
</template>

<style scoped lang="scss">
.data-center-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding-bottom: 30rpx;

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx;
    background-color: #e8f0fe;
    border-radius: 16rpx;

    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      color: #1a73e8;
      margin: 15rpx 0 10rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #5f6368;
    }
  }
}

.fee-list {
  .fee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx 0;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    &.total {
      padding-top: 30rpx;
      margin-top: 10rpx;

      .fee-label {
        font-weight: 600;
      }

      .total-amount {
        font-weight: 700;
        color: #1a73e8;
      }
    }

    .fee-label {
      font-size: 28rpx;
    }

    .fee-amount {
      font-weight: 500;
      font-size: 28rpx;
    }
  }
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  color: #999;

  text {
    margin-top: 20rpx;
  }
}
</style>
