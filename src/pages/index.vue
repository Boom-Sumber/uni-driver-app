<script setup lang="ts">
import type { Trip } from '@/types/Trip'
import { onLoad, onNavigationBarButtonTap, onPullDownRefresh } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { ref } from 'vue'
import { searchTrips } from '@/api/methods/trip'

// 路由实例
const router = useRouter()

// 导航栏按钮点击事件
onNavigationBarButtonTap((e) => {
  if (e.index === 0) {
    router.pushTab({ name: 'my' })
  }
  else if (e.index === 1) {
    router.pushTab({ name: 'insert' })
  }
})

// 路由跳转方法
const goToTrips = () => router.push({ name: 'trips' })
const goToAddTrip = () => router.pushTab({ name: 'insert' })
const editTrip = (trip: Trip) => router.pushTab({ name: 'insert', query: { id: trip.id } })

// 格式化时间范围
function formatTimeRange(trip: Trip): string {
  const timeRange = trip.time_slot
  const [startTimestampStr, endTimestampStr] = timeRange.split('-')
  const startTimestamp = Number(startTimestampStr)
  const endTimestamp = Number(endTimestampStr)

  if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
    return '无效的时间段'
  }

  const formatDate = (timestamp: number, format: 'date' | 'time') => {
    const date = new Date(timestamp * 1000)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return format === 'date'
      ? `${year}-${month}-${day}`
      : `${hours}:${minutes}`
  }

  const startTime = formatDate(startTimestamp, 'time')
  const endTime = formatDate(endTimestamp, 'time')

  return `${startTime} - ${endTime}`
}

// 今日行程数据
const todayTrips = ref<Trip[]>([])
const isRefreshing = ref(false)

async function loadTrips() {
  try {
    const currentDate = new Date().toISOString().split('T')[0]
    const trips = await searchTrips({
      trip_date: `eq.${currentDate}`,
    })
    todayTrips.value = trips || []
  }
  catch (error) {
    console.error('获取行程失败:', error)
  }
  finally {
    if (isRefreshing.value) {
      uni.stopPullDownRefresh()
      isRefreshing.value = false
    }
  }
}

onLoad(async () => {
  await loadTrips()
})

onPullDownRefresh(() => {
  isRefreshing.value = true
  setTimeout(async () => {
    await loadTrips()
  }, 500)
})
</script>

<template>
  <view class="page-container">
    <view class="page-content">
      <!-- 今日行程卡片 -->
      <wd-card class="trip-card-container">
        <template #title>
          <view class="title-container">
            <view class="title-text">
              今日行程
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
                {{ formatTimeRange(trip) }}
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
                <text>跟单: {{ trip.coordinator }}</text>
              </view>
              <view class="trip-detail">
                <wd-icon class-prefix="icon" name="feiyongguanli" size="14" custom-class="detail-icon" />
                <text>费用: ¥{{ trip.highway_fee + trip.parking_fee + trip.other_fees }}</text>
              </view>
              <view class="trip-detail edit-action" @click="editTrip(trip)">
                <wd-icon class-prefix="icon" name="bianji" color="var(--wd-text-secondary-color)" size="14" custom-class="detail-icon" />
                <text>编辑</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </wd-card>

      <!-- 快速操作卡片 -->
      <wd-card title="快速操作" class="action-card-container">
        <view class="quick-actions">
          <view class="action-item" @click="goToAddTrip">
            <wd-icon name="add-circle" size="24" color="var(--wd-primary-color)" />
            <text>新增行程</text>
          </view>
          <view class="action-item" @click="goToTrips">
            <wd-icon name="search" size="24" color="var(--wd-primary-color)" />
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
  background-color: white;
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
.action-card-container {
  ::v-deep .wd-card__content {
    padding-bottom: 30rpx !important;
  }
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
    color: var(--wd-text-secondary-color);
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
  border-left: 10rpx solid var(--wd-primary-color);
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
    }

    .trip-time {
      color: var(--wd-text-secondary-color);
      font-size: 24rpx;
    }
  }

  .trip-route {
    color: var(--wd-text-secondary-color);
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
      color: var(--wd-text-secondary-color);

      .detail-icon {
        margin-right: 12rpx;
      }

      &.edit-action {
        color: var(--wd-primary-color);
      }
    }
  }
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
    background-color: var(--wd-secondary-color);
    border-radius: 16rpx;

    text {
      margin-top: 15rpx;
      font-weight: 500;
    }
  }
}
</style>
