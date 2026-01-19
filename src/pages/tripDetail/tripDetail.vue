<!-- tripDetail.vue -->
<script setup lang="ts">
import type { Employee } from '@/types/empl.ts'
import type { Trip, TripExpand } from '@/types/trip'
import { onLoad } from '@dcloudio/uni-app'
import { queryCache, setCache } from 'alova'
import { useRouter } from 'uni-mini-router'
import { computed, ref } from 'vue'
import { dayjs } from 'wot-design-uni'
import { alovaInst } from '@/api'
import { getEmployees } from '@/api/methods/empl'
import { deleteTrip } from '@/api/methods/trip'

const router = useRouter()

// 行程详情数据
const tripDetail = ref<Trip | null>(null)
const empl_list = ref<Employee[]>([])
const isLoading = ref(true)

let startDate: string = ''
let endDate: string = ''

// 获取边框颜色的函数
function getBorderColor(trip: Trip): string {
  return (trip.trips_expand as TripExpand)?.is_calculate ? '#07c160' : '#ff4949'
}

// 计算总费用
const totalFee = computed(() => {
  if (!tripDetail.value)
    return 0
  return (tripDetail.value.highway_fee + tripDetail.value.parking_fee + tripDetail.value.other_fees).toFixed(2)
})

// 格式化日期时间
function formatDateTime(dateTime: string) {
  const validTimeStr = dateTime.replace(' ', '+')
  return dayjs(validTimeStr).format('YYYY-MM-DD HH:mm:ss')
}

// 获取员工名称
function getEmployeeName(emplId: string) {
  const employee = empl_list.value.find(empl => empl.id === emplId)
  return employee?.name || '未知'
}

// 处理返回
function handleBack() {
  router.back()
}

// 编辑行程
function handleEdit() {
  if (!tripDetail.value)
    return

  router.push({
    name: 'upsert',
    params: {
      mode: 'edit',
      trip: JSON.stringify(tripDetail.value),
      startDate,
      endDate,
    },
  })
}

// 删除行程
function handleDelete() {
  if (!tripDetail.value)
    return

  uni.showModal({
    title: '确认删除',
    content: '确定要删除行程吗？',
    success: (res) => {
      if (res.confirm) {
        const methodSnapshot = alovaInst.snapshots.match(`trip_${startDate}_${endDate}`, true)
        const isCacheExist = !!methodSnapshot
        const targetMethod = isCacheExist ? (Array.isArray(methodSnapshot) ? methodSnapshot[0] : methodSnapshot) : null

        if (!targetMethod) {
          uni.showToast({ msg: '目标方法不存在', duration: 2000 })
          throw new Error('目标alova实例不存在')
        }
        // 调用删除接口
        deleteTrip(tripDetail.value?.id || '')
          .then(async () => {
            const cacheData = await queryCache(targetMethod) as Trip[]
            if (cacheData && Array.isArray(cacheData) && cacheData.length > 0) {
              const updatedCache = cacheData.filter(item => item.id !== tripDetail.value?.id)
              await setCache(targetMethod, updatedCache)
              uni.$emit('refreshTripList', { isRefresh: true })
            }

            uni.showToast({
              title: '行程删除成功',
              icon: 'success',
            })
            setTimeout(() => router.back({
              animationType: 'slide-out-right',
              delta: 2,
            }), 1500)
          })
          .catch((error) => {
            console.error('删除行程失败:', error)
            uni.showToast({
              title: '删除失败',
              icon: 'error',
            })
          })
      }
    },
  })
}

onLoad(async (options) => {
  try {
    // 获取员工列表
    empl_list.value = await getEmployees()

    // 获取行程
    const trip = JSON.parse(options?.trip || '{}') as Trip
    if (!trip) {
      uni.showToast({
        title: '行程ID不存在',
        icon: 'error',
      })
      setTimeout(() => router.back(), 1500)
      return
    }
    startDate = options?.startDate || dayjs().subtract(1, 'month').format('YYYY-MM-DD')
    endDate = options?.endDate || dayjs().format('YYYY-MM-DD')

    // 加载行程详情
    tripDetail.value = trip
  }
  catch (error) {
    console.error('加载行程详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <view class="page-container">
    <view class="page-content">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <wd-icon name="loading" size="48" color="var(--theme-color)" />
        <text class="loading-text">
          加载中...
        </text>
      </view>

      <!-- 行程详情卡片 -->
      <wd-card v-else-if="tripDetail" custom-class="detail-card">
        <!-- 状态头部 -->
        <view
          class="status-header"
        >
          <view class="status-row">
            <text class="tracking-number">
              {{ tripDetail.tracking_number }}
            </text>
            <view
              class="status-badge"
              :style="{
                borderColor: getBorderColor(tripDetail),
                color: getBorderColor(tripDetail),
              }"
            >
              {{ (tripDetail.trips_expand as TripExpand)?.is_calculate ? '已核算' : '未核算' }}
            </view>
          </view>

          <view class="date-time-row">
            <text class="trip-date">
              {{ tripDetail.trip_date }}
            </text>
            <text class="time-slot">
              {{ tripDetail.time_slot }}
            </text>
          </view>

          <view class="route-row">
            <text class="route-text">
              {{ tripDetail.start_location }} → {{ tripDetail.end_location }}
            </text>
          </view>
        </view>

        <wd-card custom-class="scroll-card">
          <scroll-view scroll-y style="max-height: 860rpx;width: 100%;">
            <!-- 基本信息 -->
            <view class="section">
              <view class="section-title">
                <wd-icon name="view-module" size="18" color="#666" />
                <text>基本信息</text>
              </view>

              <view class="info-grid">
                <view class="info-item">
                  <text class="info-label">
                    跟单人员
                  </text>
                  <text class="info-value">
                    {{ getEmployeeName(tripDetail.empl_id) }}
                  </text>
                </view>

                <view class="info-item">
                  <text class="info-label">
                    行驶里程
                  </text>
                  <text class="info-value">
                    {{ tripDetail.distance }} km
                  </text>
                </view>

                <view class="info-item">
                  <text class="info-label">
                    创建时间
                  </text>
                  <text class="info-value">
                    {{ formatDateTime(tripDetail.created_at) }}
                  </text>
                </view>

                <view class="info-item">
                  <text class="info-label">
                    更新时间
                  </text>
                  <text class="info-value">
                    {{ formatDateTime(tripDetail.updated_at) }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 费用明细 -->
            <view class="section">
              <view class="section-title">
                <wd-icon name="coin" size="18" color="#666" />
                <text>费用明细</text>
              </view>

              <view class="fee-list">
                <view class="fee-item">
                  <text class="fee-label">
                    高速费
                  </text>
                  <text class="fee-value">
                    ¥{{ tripDetail.highway_fee.toFixed(2) }}
                  </text>
                </view>

                <view class="fee-item">
                  <text class="fee-label">
                    停车费
                  </text>
                  <text class="fee-value">
                    ¥{{ tripDetail.parking_fee.toFixed(2) }}
                  </text>
                </view>

                <view class="fee-item">
                  <text class="fee-label">
                    其他费用
                  </text>
                  <text class="fee-value">
                    ¥{{ tripDetail.other_fees.toFixed(2) }}
                  </text>
                </view>

                <view class="fee-total">
                  <text class="total-label">
                    费用总计
                  </text>
                  <text class="total-value">
                    ¥{{ totalFee }}
                  </text>
                </view>

                <!-- 核算费用（如果有） -->
                <view
                  v-if="(tripDetail.trips_expand as TripExpand)?.calculate_fee"
                  class="fee-calculate"
                >
                  <text class="calculate-label">
                    核算金额
                  </text>
                  <text class="calculate-value">
                    ¥{{ (tripDetail.trips_expand as TripExpand)?.calculate_fee?.toFixed(2) }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 备注 -->
            <view v-if="tripDetail.remarks" class="section">
              <view class="section-title">
                <wd-icon name="comment" size="18" color="#666" />
                <text>备注信息</text>
              </view>

              <view class="remarks-content">
                <text>{{ tripDetail.remarks }}</text>
              </view>
            </view>
          </scroll-view>
        </wd-card>

        <!-- 底部操作按钮 -->
        <view class="action-buttons">
          <wd-button
            type="error"
            size="large"
            block
            @click="handleDelete"
          >
            删除行程
          </wd-button>
          <wd-button
            type="primary"
            size="large"
            block
            @click="handleEdit"
          >
            编辑行程
          </wd-button>
        </view>
      </wd-card>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <wd-icon name="warning" size="48" color="#999" />
        <text class="empty-text">
          未找到行程信息
        </text>
        <wd-button type="primary" size="small" @click="handleBack">
          返回
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import url('@/static/iconfont/iconfont.css');

.page-container {
  min-height: 100vh;
  background-color: var(--primary-bg-color);
}

// 导航栏
.detail-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .nav-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

.page-content {
  padding: 20rpx;
  padding-bottom: 40rpx;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .loading-text {
    margin-top: 30rpx;
    color: #666;
    font-size: 28rpx;
  }
}

// 详情卡片
:deep(.detail-card) {
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  border-radius: 16rpx;
  padding-top: 30rpx;

  ::v-deep .wd-card__content {
    padding: 0 !important;
  }
}

// 状态头部
.status-header {
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .tracking-number {
      font-size: 30rpx;
      font-weight: 700;
      color: #333;
    }

    .status-badge {
      padding: 8rpx 20rpx;
      border: 2rpx solid;
      border-radius: 50rpx;
      font-size: 24rpx;
      font-weight: 500;
    }
  }

  .date-time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .trip-date {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
    }

    .time-slot {
      font-size: 28rpx;
      color: #666;
      background-color: #f0f0f0;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
    }
  }

  .route-row {
    .route-text {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

// 内容区块
.section {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .section-title {
    display: flex;
    align-items: center;
    gap: 15rpx;
    margin-bottom: 30rpx;

    text {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

.scroll-card {
  padding: 0 !important;
  width: 100%;
  justify-content: center;
  margin: 0;
}

// 信息网格
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25rpx;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .info-label {
      font-size: 24rpx;
      color: #999;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

// 费用列表
.fee-list {
  .fee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .fee-label {
      font-size: 28rpx;
      color: #666;
    }

    .fee-value {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
    }
  }

  .fee-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25rpx 0;
    margin-top: 10rpx;
    border-top: 2rpx solid #333;

    .total-label {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
    }

    .total-value {
      font-size: 40rpx;
      color: var(--theme-color);
      font-weight: 700;
    }
  }

  .fee-calculate {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    margin-top: 10rpx;
    border-top: 1rpx solid #07c160;

    .calculate-label {
      font-size: 28rpx;
      color: #07c160;
      font-weight: 500;
    }

    .calculate-value {
      font-size: 32rpx;
      color: #07c160;
      font-weight: 600;
    }
  }
}

// 备注内容
.remarks-content {
  padding: 25rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
}

// 底部操作按钮
.action-buttons {
  display: flex;
  padding: 30rpx;
  align-items: center;
  justify-content: center;

  ::v-deep .wd-button {
    border-radius: 25rpx;
    margin: 15rpx;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-text {
    margin: 30rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
