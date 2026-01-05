<script setup lang="ts">
import type { CalendarInstance } from 'wot-design-uni/components/wd-calendar/types'
import type { Employee } from '@/types/empl.ts'
import type { Trip } from '@/types/trip'
import { onLoad, onNavigationBarButtonTap, onPullDownRefresh } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { ref, watch } from 'vue'
import { dayjs } from 'wot-design-uni'
import { getEmployees } from '@/api/methods/empl'
import { searchTrips } from '@/api/methods/trip'
import CountdownJumpPopup from '@/components/CountdownJumpPopup.vue'
import { useCacheVersionStore } from '@/stores/cacheVersion'

const showPopup = ref(false)
// 路由实例
const router = useRouter()

const cacheVersionStore = useCacheVersionStore()

// 日历组件实例
const calendarRef = ref<CalendarInstance>()

// 日期选择器
const dateValue = ref<number>(Date.now())
const cardTitle = ref('')
// 今日行程数据
const todayTrips = ref<Trip[]>([])

const isRefreshing = ref(false)

const empl_list = ref<Employee[]>([])

// 路由跳转方法
const goToTrips = () => router.pushTab({ name: 'tripManager' })
const goToAddTrip = () => router.push({ name: 'upsert', params: { mode: 'add' } })

// 日期选择器改变事件
function handleCalendarconfirm({ value }: { value: number }) {
  // dateValue.value = value
  cardTitle.value = formatTitle(value)
  calendarRef.value?.close()
}

onLoad(async () => {
  // 监听tabBar点击事件
  uni.$on('jumpToLogin', (pause) => {
    if (pause) {
      showPopup.value = true
    }
  })
  uni.$on('refreshTripList', async () => {
    await loadTrips()
  })
  empl_list.value = await getEmployees()
  cardTitle.value = formatTitle(dateValue.value)
  await loadTrips()
})

onPullDownRefresh(() => {
  isRefreshing.value = true
  setTimeout(async () => {
    await loadTrips()
  }, 1000)
})
// 导航栏按钮点击事件
onNavigationBarButtonTap((e) => {
  if (e.index === 0) {
    // uni.removeStorageSync('token_expire_at')
    // router.pushTab({ name: 'my' })
  }
  else if (e.index === 1) {
    calendarRef.value?.open()
  }
})
watch(dateValue, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadTrips(newValue)
  }
})

function editTrip(trip: Trip) {
  return router.push({ name: 'upsert', params: { mode: 'edit', trip: JSON.stringify(trip) } })
}

async function loadTrips(seachDate?: number) {
  const cacheExpire = dayjs(new Date().setHours(23, 59, 59, 999)).valueOf()
  const seachParam = dayjs(seachDate || dateValue.value).format('YYYY-MM-DD')
  const config = {
    // 通过name获取请求的method实例
    params: {
      trip_date: `eq.${seachParam}`,
      // 排序 按创建时间降序
      order: 'created_at.desc',
    },
    name: `trip_${seachParam}`,
    cacheFor: {
      // 设置缓存模式为持久化模式
      mode: 'restore',
      // 设置缓存时间为当天23:59:59.999
      expire: cacheExpire,
      tag: cacheVersionStore.generateCacheKey(`trip_${seachParam}`),
    },
  }
  const trips = await searchTrips(config)
  todayTrips.value = trips || []

  if (isRefreshing.value) {
    uni.stopPullDownRefresh()
    isRefreshing.value = false
  }
}

// 格式化卡片标题,判断是不是今天,如果是今天,则添加(今日)后缀
function formatTitle(timestamp: number): string {
  const currentDate = dayjs(new Date()).format('YYYY-MM-DD')
  const selectedDate = dayjs(timestamp).format('YYYY-MM-DD')

  return selectedDate === currentDate ? `${selectedDate}(今日)` : selectedDate
}
</script>

<template>
  <countdown-jump-popup
    v-model:model-value="showPopup"
    jump-now-btn-text="立即跳转"
    :countdown="5"
  />
  <wd-calendar
    ref="calendarRef"
    v-model="dateValue"
    :min-date="dayjs().subtract(1, 'month').valueOf()"
    :max-date="dayjs().valueOf()"
    :with-cell="false"
    @confirm="handleCalendarconfirm"
  />
  <view class="page-container">
    <view class="page-content">
      <!-- 今日行程卡片 -->
      <wd-card class="trip-card-container">
        <template #title>
          <view class="title-container">
            <view class="title-text">
              {{ cardTitle }}
            </view>
            <wd-button type="icon" icon="add" @click="goToAddTrip" />
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="todayTrips.length === 0" class="empty-state">
          <wd-icon name="cloud-download" size="48px" />
          <text class="empty-text">
            今日暂无行程记录
          </text>
          <wd-button type="primary" size="small" @click="goToAddTrip">
            新增
          </wd-button>
        </view>

        <!-- 行程列表 - 使用 scroll-view 替代 div -->
        <scroll-view
          v-else
          class="trip-list"
          scroll-y
        >
          <view
            v-for="(trip, index) in todayTrips"
            :key="index"
            class="trip-item"
          >
            <view class="trip-header">
              <text class="trip-title">
                {{ trip.tracking_number }}
              </text>
              <text class="trip-time">
                {{ trip.time_slot }}
              </text>
            </view>
            <text class="trip-route">
              {{ trip.start_location }} → {{ trip.end_location }}
            </text>
            <view class="trip-details">
              <view class="trip-detail">
                <wd-icon class-prefix="icon" name="daolu" size="14" custom-class="detail-icon" />
                <text>里程: {{ trip.distance }}km</text>
              </view>
              <view class="trip-detail">
                <wd-icon class-prefix="icon" name="user" size="14" custom-class="detail-icon" />
                <text>跟单: {{ empl_list.find(empl => empl.id === trip.empl_id)?.name || '未知' }}</text>
              </view>
              <view class="trip-detail">
                <wd-icon class-prefix="icon" name="feiyongguanli" size="14" custom-class="detail-icon" />
                <text>费用: ¥{{ trip.highway_fee + trip.parking_fee + trip.other_fees }}</text>
              </view>
              <view class="trip-detail edit-action" @click="editTrip(trip)">
                <wd-icon class-prefix="icon" name="bianji" color="var(--theme-color)" size="14" custom-class="detail-icon" />
                <text>编辑</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </wd-card>

      <!-- 快速操作卡片 -->
      <wd-card title="快速操作" custom-title-class="title-text" custom-class="action-card-container">
        <view class="quick-actions">
          <view class="action-item" @click="goToAddTrip">
            <wd-icon name="add-circle" size="24" color="var(--theme-color)" />
            <text>新增行程</text>
          </view>
          <view class="action-item" @click="goToTrips">
            <wd-icon name="search" size="24" color="var(--theme-color)" />
            <text>查询行程</text>
          </view>
        </view>
      </wd-card>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import url('@/static/iconfont/iconfont.css');

.page-container {
  min-height: 100vh;
  background-color: var(--primary-bg-color);
}

.page-content {
  padding: 20rpx;
  padding-bottom: 120rpx; // 为tabbar留出空间
}

// 卡片容器样式 - 重点：添加阴影
.trip-card-container,
.action-card-container {
  margin-bottom: 30rpx; /* 增加外边距，防止阴影被遮挡 */
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

// 今日行程卡片内部样式
.trip-card-container {
  ::v-deep .wd-card__content {
    padding-bottom: 30rpx !important;
  }
}

// 快速操作卡片内部样式
:deep(.action-card-container) {
  padding-bottom: 30rpx !important;
}

.title-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-text {
  font-size: 36rpx;
  font-weight: 600;
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .empty-text {
    margin: 20rpx 0;
    color: var(--wot-color-secondary);
    font-size: 28rpx;
  }
}

// 行程列表样式 (scroll-view)
.trip-list {
  width: 100%;
  height: 500rpx; /* 关键：给 scroll-view 设定固定高度 */
  padding-top: 10rpx;
  padding-bottom: 20rpx;
}

.trip-item {
  border-left: 10rpx solid var(--theme-color);
  padding-left: 20rpx;
  margin-bottom: 30rpx;
  padding-bottom: 10rpx;

  .trip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;

    .trip-title {
      font-weight: 600;
      font-size: 32rpx;
      color: var(--wot-color-secondary);
    }

    .trip-time {
      color: var(--wot-color-secondary);
      font-size: 24rpx;
    }
  }

  .trip-route {
    color: var(--wot-color-secondary);
    font-size: 28rpx;
    margin-bottom: 15rpx;
    display: block;
  }

  .trip-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15rpx;

    .trip-detail {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: var(--wot-color-secondary);

      .detail-icon {
        margin-right: 12rpx;
      }

      &.edit-action {
        color: var(--theme-color);
      }
    }
  }
}

:deep(.title-text) {
  font-size: 36rpx;
  font-weight: 600;
}

// 快速操作样式
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding-top: 10rpx;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30rpx;
    background-color: var(--secondary-bg-color);
    border-radius: 16rpx;

    text {
      margin-top: 15rpx;
      font-weight: 500;
    }
  }
}
</style>
