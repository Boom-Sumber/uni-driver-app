<script setup lang="ts">
import { computed, ref, watch } from 'vue'
/**
 * 自定义选择器弹窗组件
 * 支持多列选择，可自定义标题、加载状态、关闭时是否重置选择
 */
interface CustomPickerPopupProps {
  // 控制组件显示/隐藏
  modelValue?: boolean
  // 选择器的列数据
  columns: string[]
  // 标题
  title?: string
  // 是否显示加载状态
  loading?: boolean
  // 组件关闭时是否重置临时选择（默认重置，确保每次打开都是初始状态）
  resetOnClose?: boolean

  itemHeight?: number

}
/**
 * 自定义选择器弹窗组件事件
 */
interface CustomPickerPopupEmits {
  // 同步更新 modelValue 状态
  (e: 'update:modelValue', value: boolean): void
  // 确认选择事件，传递选中的值（null 表示取消）
  (e: 'confirm', value: string): void
  // 取消选择事件
  (e: 'cancel'): void
  // 选择器滚动变化事件，传递当前选中的值
  (e: 'change', { value, index}: { value: string, index: number }): void
}
/**
 * 自定义选择器弹窗组件默认值
 */
const props = withDefaults(defineProps<CustomPickerPopupProps>(), {
  title: '请选择',
  loading: false,
  resetOnClose: true,
  itemHeight: 45,
  modelValue: false,
})

/**
 * 自定义选择器弹窗组件事件
 */
const emit = defineEmits<CustomPickerPopupEmits>()

// 1. 控制 Popup 内部显示状态
const internalVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// 2. 临时存储用户滚动时选择的值（索引数组）
const tempSelectedValue = ref<string>('')
const isConfirmed = ref<boolean>(false)

// 3. 初始化临时选择值
function initializeTempValue() {
  if (props.columns && props.columns.length > 0) {
    // 初始化为选中值或第一个选项
    tempSelectedValue.value = props.columns[0]
  }
  else {
    tempSelectedValue.value = ''
  }
  isConfirmed.value = false
}
/**
 * 计算选择器高度
 */
const columnsHeight = computed(() => {
  if (props.columns && props.columns.length > 0) {
    const height = props.columns.length * props.itemHeight + 100
    if (height > 300) {
      return 300
    }
    return height
  }
  return 100
})

// 4. 监听显示状态变化，当显示时初始化, 且仅初始化一次
let openCount = 0
watch(() => props.modelValue, (newValue) => {
  openCount++
  if (newValue && openCount === 1) {
    initializeTempValue()
  }
})

// 5. 监听 columns 变化，初始化临时选择值
watch(() => props.columns, () => {
  if (internalVisible.value) {
    initializeTempValue()
  }
}, { immediate: true })

// 6. 点击遮罩层或Popup自带的关闭按钮时触发
function handlePopupClose() {
  // 关闭时，根据 resetOnClose 决定是否重置临时选择
  if (props.resetOnClose) {
    initializeTempValue()
  }
  // 点击遮罩层关闭不触发外部cancel事件，仅关闭弹窗
}

// 7. 点击取消按钮
function handleCancel() {
  initializeTempValue()
  internalVisible.value = false
  emit('cancel')
}

// 8. 点击确认按钮
function handleConfirm() {
  const selectedValue = tempSelectedValue.value
  emit('confirm', selectedValue)
  internalVisible.value = false
}

// 9. 选择器滚动变化
function handlePickerChange({ value, index}: { value: string, index: number }) {
  if (value !== '') {
    emit('change', { value, index })
  }
}

/**
 * 暴露方法供父组件调用（如果需要）
 */
defineExpose({
  // 可以暴露重置方法
  resetSelection: initializeTempValue,
})
</script>

<template>
  <!-- 弹出层容器 -->
  <wd-popup
    v-model="internalVisible"
    position="bottom"
    :close-on-click-modal="true"
    custom-class="custom-picker-popup"
    @close="handlePopupClose"
  >
    <view class="custom-picker">
      <!-- 自定义顶部工具栏 -->
      <view class="picker-header">
        <text class="header-btn cancel-btn" @click="handleCancel">
          取消
        </text>
        <text v-if="title" class="header-title">
          {{ title }}
        </text>
        <text class="header-btn confirm-btn" @click="handleConfirm">
          确认
        </text>
      </view>

      <!-- PickerView 选择器主体 -->
      <wd-picker-view
        v-model="tempSelectedValue"
        :columns="columns"
        :loading="loading"
        :columns-height="columnsHeight"
        :item-height="itemHeight"
        @change="handlePickerChange"
      />
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.custom-picker {
  background-color: #ffffff;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
  overflow: hidden;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background-color: #fff;

  .header-btn {
    font-size: 28rpx;
    padding: 8rpx 16rpx;
    border-radius: 6rpx;
    transition: background-color 0.2s;
  }

  .cancel-btn {
    color: #666;
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .confirm-btn {
    color: var(--theme-color); /* 主色调，可自定义 */
    font-weight: 500;
    &:active {
      background-color: rgba(var(--base-color-rgb), 0.1);
    }
  }

  .header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
    text-align: center;
  }
}

:deep(.custom-picker-popup) {
  border-radius: 32rpx;
}
</style>
