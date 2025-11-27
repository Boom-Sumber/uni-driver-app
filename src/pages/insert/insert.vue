<script setup lang="ts">
import type { Trip } from '@/types/Trip'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { computed, ref } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()

// 路由实例
// const router = useRouter()

// 表单数据 - 确保所有字段都有初始值
const formData = ref<Trip>({
  trip_date: '',
  id: '', // 新增：默认 id
  user_id: '', // 新增：默认 user_id
  tracking_number: '',
  time_slot: '',
  coordinator: '',
  start_location: '',
  end_location: '',
  distance: 0,
  highway_fee: 0,
  parking_fee: 0,
  other_fees: 0,
  remarks: '',
})

// 时间选择器相关
const startTime = ref('')
const endTime = ref('')
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const showDatePicker = ref(false)

const showCoordinatorPicker = ref(false)
const coordinatorOptions = ref<string[]>([])
const selectedCoordinatorIndex = ref(-1)

// 计算属性：费用合计
const totalFee = computed(() => {
  const highway = Number(formData.value.highway_fee) || 0
  const parking = Number(formData.value.parking_fee) || 0
  const other = Number(formData.value.other_fees) || 0
  return highway + parking + other
})

// 页面加载
onLoad(() => {
  // 设置默认日期为今天
  const today = new Date()
  formData.value.trip_date = formatDate(today)
  // 加载跟单人员选项
  loadCoordinatorOptions()
})

// 加载跟单人员选项
function loadCoordinatorOptions() {
  // 这里应该从后端或缓存中获取跟单人员列表
  // 暂时使用模拟数据
  setTimeout(() => {
    coordinatorOptions.value = ['张三', '李四', '王五', '赵六', '钱七']
  }, 100)
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 更新时间段
function updateTimeSlot() {
  if (startTime.value && endTime.value) {
    // 这里需要将时间转换为时间戳，简化处理
    const startTimestamp = Math.floor(new Date(`1970-01-01T${startTime.value}:00`).getTime() / 1000)
    const endTimestamp = Math.floor(new Date(`1970-01-01T${endTime.value}:00`).getTime() / 1000)
    formData.value.time_slot = `${startTimestamp}-${endTimestamp}`
  }
}

// 时间选择器确认事件
function onStartTimeConfirm(event: any) {
  startTime.value = event.value
  showStartTimePicker.value = false
  updateTimeSlot()
}

function onEndTimeConfirm(event: any) {
  endTime.value = event.value
  showEndTimePicker.value = false
  updateTimeSlot()
}

function onDateConfirm(event: any) {
  formData.value.trip_date = event.value
  showDatePicker.value = false
}

// 跟单人员选择器确认事件
function onCoordinatorConfirm(event: any) {
  const index = event.value
  selectedCoordinatorIndex.value = index
  formData.value.coordinator = coordinatorOptions.value[index]
  showCoordinatorPicker.value = false
}

// 保存行程
async function saveTrip() {
  // 表单验证
  if (!validateForm()) {
    return
  }

  try {
    // 这里调用保存API
    console.warn('保存行程数据:', formData.value)

    toast.success('保存成功')
  }
  catch (error) {
    console.error('保存失败:', error)
    toast.error('保存失败')
  }
}

// 表单验证
function validateForm(): boolean {
  if (!formData.value.trip_date) {
    toast.error('请选择行程日期')
    return false
  }
  if (!formData.value.tracking_number) {
    toast.error('请输入订单号')
    return false
  }
  if (!startTime.value || !endTime.value) {
    toast.error('请选择开始和结束时间')
    return false
  }
  if (!formData.value.coordinator) {
    toast.error('请输入跟单人员')
    return false
  }
  if (!formData.value.start_location) {
    toast.error('请输入起始地点')
    return false
  }
  if (!formData.value.end_location) {
    toast.error('请输入结束地点')
    return false
  }
  if (!formData.value.distance || Number(formData.value.distance) <= 0) {
    toast.error('请输入有效里程')
    return false
  }
  return true
}
</script>

<template>
  <wd-toast />
  <view class="page-container">
    <view class="page-content">
      <!-- 基本信息卡片 -->
      <wd-card title="基本信息" class="form-card">
        <wd-cell-group border>
          <!-- 订单号 -->
          <wd-input
            v-model="formData.tracking_number"
            label="送货订单"
            placeholder="请输入订单号"
            clearable
            custom-class="required-field"
          />

          <wd-datetime-picker
            v-model="formData.trip_date"
            v-model:visible="showDatePicker"
            label="行程日期"
            required
            align-right
            default-value="2024-01-01"
            marker-side="after"
            type="date"
            @confirm="onDateConfirm"
          />

          <!-- 开始时间 -->
          <wd-datetime-picker
            v-model="startTime"
            v-model:visible="showStartTimePicker"
            label="开始时间"
            required
            placeholder="请选择"
            align-right
            marker-side="after"
            type="time"
            @confirm="onStartTimeConfirm"
          />

          <!-- 结束时间 -->
          <wd-datetime-picker
            v-model="endTime"
            v-model:visible="showEndTimePicker"
            label="结束时间"
            required
            placeholder="请选择"
            align-right
            marker-side="after"
            type="time"
            @confirm="onEndTimeConfirm"
          />

          <!-- 跟单人员 -->
          <wd-picker
            v-model="selectedCoordinatorIndex"
            v-model:visible="showCoordinatorPicker"
            label="跟单人员"
            required
            align-right
            marker-side="after"
            placeholder="请选择"
            :columns="coordinatorOptions"
            @confirm="onCoordinatorConfirm"
          />
        </wd-cell-group>
      </wd-card>

      <!-- 行程信息卡片 -->
      <wd-card title="行程信息" class="form-card">
        <wd-cell-group border>
          <!-- 起始地点 -->
          <wd-input
            v-model="formData.start_location"
            label="起始地点"
            placeholder="请输入起始地点"
            clearable
            custom-class="required-field"
          />

          <!-- 结束地点 -->
          <wd-input
            v-model="formData.end_location"
            label="结束地点"
            placeholder="请输入结束地点"
            clearable
            custom-class="required-field"
          />

          <!-- 里程 -->
          <wd-input
            v-model="formData.distance"
            label="里程(公里)"
            type="number"
            placeholder="请输入里程"
            clearable
            custom-class="required-field"
          />
        </wd-cell-group>
      </wd-card>

      <!-- 费用信息卡片 -->
      <wd-card title="费用信息" class="form-card">
        <wd-cell-group border>
          <!-- 高速费 -->
          <wd-input
            v-model="formData.highway_fee"
            label="高速费(元)"
            type="number"
            placeholder="0.00"
            clearable
          />

          <!-- 停车费 -->
          <wd-input
            v-model="formData.parking_fee"
            label="停车费(元)"
            type="number"
            placeholder="0.00"
            clearable
          />

          <!-- 其他费用 -->
          <wd-input
            v-model="formData.other_fees"
            label="其他费用(元)"
            type="number"
            placeholder="0.00"
            clearable
          />

          <!-- 费用合计 -->
          <wd-cell title="费用合计(元)" :value="totalFee.toFixed(2)" />
        </wd-cell-group>
      </wd-card>

      <!-- 备注信息卡片 -->
      <wd-card title="备注信息" class="form-card">
        <view class="textarea-container">
          <wd-textarea
            v-model="formData.remarks!"
            placeholder="请输入备注信息"
            :autosize="{ minRows: 3 }"
          />
        </view>
      </wd-card>

      <!-- 保存按钮 -->
      <view class="save-button-container" :class="{ 'picker-open': showDatePicker || showStartTimePicker || showEndTimePicker }">
        <wd-button
          type="primary"
          size="large"
          block
          custom-class="save-button"
          @click="saveTrip"
        >
          保存行程
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 20rpx;
  padding-bottom: 120rpx; // 为底部按钮留出空间
}

.form-card {
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

  ::v-deep .wd-card__content {
    padding: 0 !important;
  }
}

// 必填字段样式 - 修正红星位置
:deep(.required-field) {
  .wd-input__label,
  .wd-cell__title {
    position: relative;
    display: flex;
    align-items: center;

    &::after {
      content: '*';
      color: #fa5151;
      margin-left: 8rpx;
      line-height: 1;
      // 使用 transform 微调垂直位置
      transform: translateY(0);
    }
  }
}

// 文本域容器
.textarea-container {
  padding: 20rpx;
}

// 保存按钮容器 - 添加选择器打开时的隐藏逻辑
.save-button-container {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 1000;
  transition: opacity 0.3s ease;

  // 当选择器打开时隐藏按钮
  &.picker-open {
    opacity: 0;
    pointer-events: none;
  }
}

.form-row {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  min-height: 100rpx;
  box-sizing: border-box;
}

.save-button {
  border-radius: 16rpx !important;
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
}

// 输入框样式调整
:deep(.wd-input) {
  text-align: right;
}

// 费用合计样式
:deep(.wd-cell__value) {
  color: var(--wd-primary-color);
  font-weight: 600;
}

// 确保选择器有足够的 z-index
:deep(.wd-popup) {
  z-index: 1001 !important;
}
</style>
