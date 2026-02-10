<script setup lang="ts">
import type { CalendarInstance } from 'wot-design-uni/components/wd-calendar/types'
import type { DateRange, Trip, TripExpand } from '@/types/trip'
import { onHide, onLoad, onTabItemTap } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { nextTick, ref } from 'vue'
import { dayjs, useToast } from 'wot-design-uni'
import { refreshToken } from '@/apis/methods/auth'
import { isOfDateRange, searchTripsByDateRange, searchTripsByEndLocation, searchTripsByTrackingNumber } from '@/apis/methods/trip'

const router = useRouter()
const toast = useToast()

const queryDateRange = ref<DateRange>({
  startDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
})

const scrollTop = ref(0)

const calendarRef = ref<CalendarInstance>()

const trips = ref<Trip[]>([])

const dateRange = ref<number[]>([dayjs(queryDateRange.value.startDate).startOf('day').valueOf(), dayjs(queryDateRange.value.endDate).endOf('day').valueOf()])

const showPopup = ref(false)

const isCalculate = ref(false)

const searchModel = ref<'按日期/日期段' | '按行程订单' | '按行程终点'>('按日期/日期段')

const searchTripNumber = ref('')

const searchTripEnd = ref('')

const showSearchModelPicker = ref(false)

const showTooltip = ref(false)

const isLongPress = ref(false)

const isScroll = ref(false)

const searching = ref(false)

const isUpdateCache = ref(false)

// 过滤行程记录
const filteredTrips = ref<Trip[]>([])

const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
const endDate = dayjs().format('YYYY-MM-DD')

let timer: ReturnType<typeof setTimeout>

onLoad(async () => {
  uni.$on('refreshTripList', async () => {
    await handleSearch()
  })
  try {
    // 初始化数据
    trips.value = await searchTripsByDateRange(startDate, endDate)
    // 初始化时显示所有行程记录
    filteredTrips.value = trips.value
  }
  catch (error) {
    console.error('加载行程数据失败:', error)
    throw error
  }
})
onTabItemTap(async () => {
  try {
    const isSuccess = await refreshToken()
    if (!isSuccess) {
      showPopup.value = true
    }
  }
  catch (error) {
    showPopup.value = true
    throw error
  }
})
onHide(() => {
  clearTimeout(timer)
})

const daysOptions = ref<Record<string, any>[]>([
  { text: '今天', id: 0 },
  { text: '昨天', id: 1 },
  { text: '上半月', id: 2 },
  { text: '下半月', id: 3 },
  { text: '上个月', id: 4 },
])

async function handleSearch() {
  searching.value = true
  const currentDate = Date.now()
  try {
    // 搜索逻辑已在计算属性中处理
    if (searchModel.value === '按日期/日期段') {
      const isInRange = isOfDateRange(trips.value, queryDateRange.value)
      if (isInRange) {
        filteredTrips.value = trips.value.filter(trip => trip.trip_date >= queryDateRange.value.startDate && trip.trip_date <= queryDateRange.value.endDate)
      }
      else {
        filteredTrips.value = await searchTripsByDateRange(queryDateRange.value.startDate, queryDateRange.value.endDate)
      }
    }
    else if (searchModel.value === '按行程订单') {
      filteredTrips.value = await searchTripsByTrackingNumber(searchTripNumber.value)
    }
    else if (searchModel.value === '按行程终点') {
      filteredTrips.value = await searchTripsByEndLocation(searchTripEnd.value)
    }
  }
  catch (error) {
    console.error('查询行程记录失败:', error)
    throw error
  }

  scrollTop.value = 1
  nextTick(() => {
    scrollTop.value = 0
  })
  const submitTime = Date.now() - currentDate
  if (submitTime > 2000) {
    searching.value = false
  }
  else {
    timer = setTimeout(() => {
      searching.value = false
    }, 2000 - submitTime)
  }
}

function handleTripClick(trip: Trip) {
  if (isLongPress.value) {
    return
  }
  if (isScroll.value) {
    return
  }
  router.push({ name: 'tripDetail', params: { id: trip.id, startDate: queryDateRange.value.startDate, endDate: queryDateRange.value.endDate, isUpdateCache: JSON.stringify(isUpdateCache.value) } })
}

// 新增：处理长按
function handleLongPress(trip: Trip) {
  if (isScroll.value) {
    return
  }
  // 复制 trip的tracking_number
  uni.setClipboardData({
    data: trip.tracking_number,
    showToast: false,
    success: () => {
      toast.success('行程订单已复制')
    },
  })
  isLongPress.value = true
}
// 新增：处理长按结束
function handleLongPressEnd() {
  timer = setTimeout(() => {
    isLongPress.value = false
    isScroll.value = false
  }, 500)
}

// 新增：获取边框颜色的函数
function getBorderColor(trip: Trip): string {
  return (trip.trips_expand as TripExpand)?.is_calculate ? '#07c160' : '#ff4949'
}

// 新增：处理核算复选框变化
function handleCalculateChange() {
  // 过滤行程记录
  filteredTrips.value = trips.value.filter(trip => (trip.trips_expand as TripExpand)?.is_calculate === isCalculate.value)
}

// 新增：处理搜索模型确认
function handleSearchModelConfirm(value: string) {
  // 处理搜索模型确认逻辑
  searchModel.value = value as '按日期/日期段' | '按行程订单' | '按行程终点'
  if (searchModel.value === '按日期/日期段') {
    isUpdateCache.value = true
  }
  else {
    isUpdateCache.value = false
  }
}

// 新增：处理日历确认
function handleCalendarConfirm({ value }: { value: number[] }) {
  queryDateRange.value.startDate = dayjs(value[0]).format('YYYY-MM-DD')
  queryDateRange.value.endDate = dayjs(value[1]).format('YYYY-MM-DD')
}

// 新增：处理快捷选择点击
function onShortcutsClick({ item }: { item: Record<string, any> }) {
  const currentDay = dayjs().date()
  if (item.id === 0) {
    return [dayjs().valueOf(), dayjs().valueOf()]
  }
  else if (item.id === 1) {
    return [dayjs().subtract(1, 'day').valueOf(), dayjs().subtract(1, 'day').valueOf()]
  }
  else if (item.id === 2) {
    return [dayjs().startOf('month').valueOf(), currentDay > 15 ? dayjs().date(15).valueOf() : Date.now()]
  }
  else if (item.id === 3) {
    return [currentDay > 15 ? dayjs().date(15).valueOf() : Date.now(), Date.now()]
  }
  else if (item.id === 4) {
    return [dayjs().subtract(1, 'month').startOf('month').valueOf(), dayjs().subtract(1, 'month').endOf('month').valueOf()]
  }
}

// 新增：处理提示框打开
function handleTooltipOpen() {
  timer = setTimeout(() => {
    showTooltip.value = false
  }, 3000)
}
// 新增：处理滚动
function handleScroll() {
  isScroll.value = true
}
</script>

<template>
  <wd-toast />
  <custom-picker-popup
    v-model="showSearchModelPicker"
    :columns="['按日期/日期段', '按行程订单', '按行程终点']"
    @confirm="handleSearchModelConfirm"
  />
  <wd-calendar
    ref="calendarRef"
    v-model="dateRange"
    :with-cell="false"
    :min-date="dayjs().subtract(3, 'month').valueOf()"
    :max-date="Date.now()"
    type="daterange"
    :shortcuts="daysOptions"
    allow-same-day
    custom-class="calendar"
    :on-shortcuts-click="({ item }) => onShortcutsClick({ item }) || []"
    @confirm="handleCalendarConfirm"
  />
  <view class="trips-page" @touchmove.stop.prevent="() => {}">
    <!-- 上方固定card -->
    <view id="search-card" class="top-card">
      <wd-card title="行程查询">
        <view class="search-form">
          <view class="search_model" @click="showSearchModelPicker = true">
            <text>{{ searchModel }}</text>
            <wd-icon
              name="caret-down-small" size="22"
              custom-class="search-icon"
            />
          </view>
          <view class="search_model search-item">
            <view v-if="searchModel === '按日期/日期段'" @click="calendarRef?.open()">
              <text>{{ `${queryDateRange.startDate} 至 ${queryDateRange.endDate}` }}</text>
              <wd-icon
                name="caret-down-small" size="22"
                custom-class="search-icon"
              />
            </view>
            <view v-else-if="searchModel === '按行程订单'">
              <wd-input
                v-model="searchTripNumber"
                placeholder="请输入行程订单号"
                no-border
                style="text-align:center; width: 100%; background-color: transparent; height: 100%;"
              />
            </view>
            <view v-else-if="searchModel === '按行程终点'">
              <wd-input
                v-model="searchTripEnd"
                placeholder="请输入行程终点"
                no-border
                style="text-align:center; width: 100%; background-color: transparent; height: 100%;"
              />
            </view>
          </view>
          <wd-button type="primary" style="width: 500rpx; height: 80rpx;" :loading="searching" @click="handleSearch">
            查询
          </wd-button>
        </view>
      </wd-card>
    </view>

    <!-- 下方可滚动card -->
    <view class="bottom-card">
      <wd-card>
        <template #title>
          <view class="title">
            <view class="title-content">
              <view>历史行程</view>
              <view @click="showTooltip = !showTooltip">
                <wd-tooltip v-model="showTooltip" placement="top-start" content="点击条目查看详情" @open="handleTooltipOpen">
                  <wd-icon name="help-circle" size="26rpx" color="#ccc" />
                </wd-tooltip>
              </view>
            </view>

            <wd-checkbox v-model="isCalculate" shape="square" @change="handleCalculateChange">
              已核算
            </wd-checkbox>
          </view>
        </template>
        <view class="trip-list-container">
          <scroll-view scroll-y class="scroll-container" :scroll-top="scrollTop" @scroll="handleScroll" @touchmove.stop>
            <view v-if="filteredTrips.length === 0" class="empty-state">
              <wd-icon name="search" size="48" color="#ccc" />
              <text class="empty-text">
                暂无行程记录
              </text>
            </view>
            <view v-else>
              <view
                v-for="(trip, index) in filteredTrips"
                :key="index"
                class="trip-item"
                @click="handleTripClick(trip)"
                @longpress="handleLongPress(trip)"
                @touchend="handleLongPressEnd"
              >
                <view class="trip-content">
                  <text class="trip-title">
                    {{ trip.tracking_number }}
                  </text>
                  <text class="trip-subtitle">
                    {{ trip.trip_date }} | {{ trip.time_slot }}
                  </text>
                </view>
                <view class="trip-detail">
                  <view
                    class="trip-status"
                    :style="{
                      borderColor: getBorderColor(trip),
                      color: getBorderColor(trip),
                    }"
                  >
                    {{ (trip.trips_expand as TripExpand)?.is_calculate ? '已核算' : '未核算' }}
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </wd-card>
    </view>
  </view>
</template>

<style scoped lang="scss">
.trips-page {
  height: 100vh; /* 关键：占据整个视口高度 */
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 20rpx;
  overflow: hidden;
}

.top-card {
  margin-bottom: 20rpx;
}

.bottom-card {
  min-height: 0;
}

.title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .title-content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10rpx;
  }
}

.search-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 25rpx;
  padding: 20rpx 0;

  .search_model {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 26rpx;
    color: var(--wot-color-secondary);
    border-radius: 40rpx;
    width: 500rpx;
    height: 80rpx;
    background-color: var(--tertiary-bg-color);
    transition: background-color 0.2s;
    position: relative;

    :deep(.search-icon) {
      position: absolute;
      right: 30rpx;
      top: 50%;
      color: var(--wot-color-secondary);
      transform: translateY(-50%);
    }

    :deep(.calendar) {
      width: 100%;
      height: 100%;
      background: transparent;
    }

    &:hover {
      border:2rpx solid var(--theme-color);
      box-shadow: 0px 0px 10rpx var(--theme-secondary-color);
    }
  }
}

.trip-list-container {
  min-height: 0;
  padding: 0 20rpx 40rpx 20rpx;
}

.scroll-container {
  height: 670rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .empty-text {
    margin-top: 20rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.trip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .trip-content {
    flex: 1;

    .trip-title {
      display: block;
      font-weight: 500;
      font-size: 32rpx;
      margin-bottom: 10rpx;
    }

    .trip-subtitle {
      color: #5f6368;
      font-size: 24rpx;
    }
  }

  .trip-detail {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: var(--wot-color-secondary);

      .detail-icon {
        margin-right: 12rpx;
      }

      .trip-status {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border: 2rpx solid;
        border-radius: 8rpx;
        white-space: nowrap;
        margin-left: 60rpx;
      }
    }
}
</style>
