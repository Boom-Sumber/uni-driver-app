<script setup lang="ts">
import type { CountdownJumpPopupProps } from '@/types/countdownJumpPopup'
import { useRouter } from 'uni-mini-router'
import { onMounted, onUnmounted, ref, watch } from 'vue'

// 用 withDefaults 设置默认值（APP 端无需多端差异化默认值）
const props = withDefaults(defineProps<CountdownJumpPopupProps>(), {
  title: '登录过期',
  content: '您的登录已过期，是否重新登录？',
  targetPageName: '登录页',
  routerName: 'login',
  countdown: 3,
  closable: false,
  jumpNowBtnText: '立即跳转',
  closeOnClickModal: false,
  showJumpNowBtn: true,
  routeType: 'replaceAll',
  position: 'center',
  modal: true,
  zIndex: 9999,
})
// ====================== Props + 默认值（APP 端精简配置）======================

const emit = defineEmits<CountdownJumpPopupEmits>()
const router = useRouter()
// ====================== 精简 TS 类型定义（仅保留 APP 端必需属性）======================

interface CountdownJumpPopupEmits {
  (e: 'close'): void
  (e: 'jump', targetPageName: string): void
  (e: 'cancel'): void
  (e: 'update:modelValue', value: boolean): void
}

// ====================== 核心逻辑（APP 端无冗余）======================
const remainingTime = ref<number>(props.countdown)
let countdownTimer: number | null = null

// 初始化倒计时（APP 端定时器无兼容性问题）
function initCountdown() {
  remainingTime.value = props.countdown
  if (remainingTime.value <= 0) {
    handleJump()
    return
  }
  countdownTimer = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(countdownTimer!)
      handleJump()
    }
  }, 1000)
}

// APP 端路由跳转
function handleJump() {
  const { routeType, routerName } = props
  emit('update:modelValue', false)
  emit('jump', routerName)

  switch (routeType) {
    case 'pushTab':
      router.pushTab({ name: routerName })
      break
    case 'replace':
      router.replace({ name: routerName })
      break
    case 'replaceAll':
      router.replaceAll({ name: routerName })
      break
    case 'back':
      router.back()
      break
    default:
      router.push({ name: routerName })
  }
}

// 关闭弹窗（清除定时器，APP 端无内存泄漏风险）
function handleClose() {
  countdownTimer && clearInterval(countdownTimer)
  emit('update:modelValue', false)
  emit('close')
  emit('cancel')
}

// 点击遮罩处理（APP 端遮罩点击响应更灵敏）
function handleModalClick() {
  props.closeOnClickModal && handleClose()
}

// ====================== 生命周期（APP 端简化）======================
onMounted(() => {
  props.modelValue && initCountdown()
})

onUnmounted(() => {
  countdownTimer && clearInterval(countdownTimer)
})

// 监听弹窗显示状态（APP 端响应式无延迟）
watch(
  () => props.modelValue,
  (newVal) => {
    newVal ? initCountdown() : (countdownTimer && clearInterval(countdownTimer))
  },
  { immediate: true },
)

// 监听倒计时时长变化
watch(
  () => props.countdown,
  (newVal) => {
    remainingTime.value = newVal
    props.modelValue && (countdownTimer && clearInterval(countdownTimer)) && initCountdown()
  },
  { immediate: true },
)
</script>

<template>
  <!-- 仅保留 WOT UI Popup 核心，移除多端 page-meta -->
  <wd-popup
    v-model="modelValue"
    v-bind="$attrs"
    :safe-area-inset-bottom="true"
    :closable="closable"
    :close-on-click-modal="closeOnClickModal"
    :lock-scroll="true"
    custom-style="border-radius: 32rpx;width: 80%;"
    @close="handleClose"
    @click-modal="handleModalClick"
  >
    <view class="countdown-jump-popup">
      <!-- 标题区 -->
      <view v-if="title" class="popup-title">
        {{ title }}
      </view>

      <!-- 内容区 -->
      <view v-if="content" class="popup-content">
        {{ content }}
      </view>

      <!-- 倒计时核心区（text 包裹文本，APP 端文本渲染更清晰） -->
      <view class="countdown-tip">
        倒计时 <text class="countdown-number">
          {{ remainingTime }}
        </text> 秒后，
        自动跳转到 <text class="target-page">
          {{ targetPageName }}
        </text>
      </view>

      <!-- 立即跳转按钮（添加 APP 触摸反馈 hover-class） -->
      <button
        v-if="showJumpNowBtn"
        class="jump-now-btn"
        hover-class="jump-now-btn_hover"
        @click="handleJump"
      >
        {{ jumpNowBtnText }}
      </button>
    </view>
  </wd-popup>
</template>

<style scoped>
.countdown-jump-popup {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
  min-height: 300rpx;
  justify-content: center; /* 垂直方向居中（因 flex-direction 为 column） */
  align-items: center;     /* 水平方向居中（可选，确保内容整体居中） */
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
}

.popup-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.7;
  text-align: center;
}

.countdown-tip {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-top: 8rpx;
}

.countdown-number {
  color: #1989fa;  /* 与 WOT UI 主题一致，APP 端显示清晰 */
  font-size: 32rpx;
  font-weight: 600;
  margin: 0 8rpx;
}

.target-page {
  color: #1989fa;
  font-weight: 500;
  margin: 0 8rpx;
}

/* APP 端按钮优化：原生触摸反馈 + 渐变背景 */
.jump-now-btn {
  margin-top: 20rpx;
  padding: 0 8rpx;
  width: 80%;
  min-width: 200rpx;
  background: linear-gradient(45deg, #668DF8, #4F7CF8);  /* APP 端渐变背景更美观 */
  color: #fff;
  font-size: 28rpx;
  border-radius: 18rpx;
  border: none;
}

.jump-now-btn::after {
  border: none;
}

/* APP 端触摸反馈样式 */
.jump-now-btn_hover {
  opacity: 0.9;
}
</style>
