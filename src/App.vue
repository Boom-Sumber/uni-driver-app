<script setup lang="ts">
import { onError, onHide, onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'
import { dayjs } from 'wot-design-uni'
import { refreshToken } from '@/apis/methods/auth'
import { getEmployees } from '@/apis/methods/employee'
import { searchTripsByDateRange } from './apis/methods/trip'
import { useAppStartStore } from './stores/appStart'
import { getStorage, removeStorageWithPrefixKey, setStorage } from './utils/storage'

const appStartStore = useAppStartStore()

const refreshTimer = ref<any>()
const endDate = dayjs().format('YYYY-MM-DD')
const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
const initStartApp = getStorage('initStartApp')
const isLoaded = ref(false)

// 启动定时器，每天凌晨刷新数据
function startRefreshTimer() {
  // 先清除之前的定时器
  clearRefreshTimer()

  // 计算到凌晨的时间
  const now = Date.now()
  const nextMidnight = getNextMidnight(now)
  const delay = nextMidnight - now

  refreshTimer.value = setTimeout(() => {
    executeRefresh()
    // 刷新完成后重新设置定时器
    startRefreshTimer()
  }, delay)
}

// 清理定时器
function clearRefreshTimer() {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
}

// 计算下次刷新的时间
function getNextMidnight(date: number) {
  return dayjs(date).add(1, 'day').startOf('day').valueOf()
}

// 执行刷新操作
function executeRefresh() {
  removeStorageWithPrefixKey('trip')
  // 使用全局事件发送刷新指令
  uni.$emit('daily-refresh', { isRefresh: true })
}

// 检查是否需要刷新数据
function checkAndRefresh() {
  // 检查上次刷新时间，如果错过了就立即刷新
  const lastRefresh = getStorage('last_refresh_time')
  const now = Date.now()

  if (lastRefresh) {
    const lastDate = dayjs(lastRefresh).valueOf()
    const shouldHaveRefreshed = getNextMidnight(lastDate)
    if (now >= shouldHaveRefreshed) {
      executeRefresh()
    }
  }
  else {
    // 第一次启动，立即刷新数据
    executeRefresh()
  }
  setStorage('last_refresh_time', now, 'infinitely')
}

onShow(() => {
  if (isLoaded.value) {
    // 应用激活时检查是否需要刷新
    checkAndRefresh()
    // 应用激活时重新设置定时器
    startRefreshTimer()
  }
})

onHide(() => {
  // 应用进入后台时清理定时器
  clearRefreshTimer()
})

onMounted(async () => {
  const timer = Date.now()
  if (initStartApp) {
    try {
      // 刷新token
      await refreshToken()
      // 获取所有员工
      await getEmployees()
      // 初始化行程数据
      await searchTripsByDateRange(startDate, endDate)
      appStartStore.setStarted(true)
      // 跳转首页
      uni.reLaunch({
        url: `/pages/index`,
      })
    }
    catch (error) {
      uni.reLaunch({
        url: `/pages/auth/login`,
      })
      throw error
    }
  }
  else {
    // 跳转登录页
    uni.reLaunch({
      url: `/pages/auth/login`,
    })
  }
  // 等待2秒，确保登录页加载完成
  if (Date.now() - timer < 2000) {
    await new Promise(resolve => setTimeout(resolve, 2000 - (Date.now() - timer)))
  }

  // 启动定时器，每天凌晨刷新数据
  startRefreshTimer()
  // 初始化完成，设置为已加载状态
  isLoaded.value = true
  // 手动关闭启动屏
  plus.navigator.closeSplashscreen()
})

onError((err) => {
  console.error('错误捕获', err)
})
</script>

<style lang="scss">
  @import './static/iconfont/iconfont.css';
  @import './styles/theme.scss';
:root,
page {
  --base-color-rgb: 102,141,248;  // 主要颜色 499eff
  --base-bg-color-rgb: 255,255,255;  // 主要背景颜色 27,209,165
  --base-white-rgb: 255,255,255;  // 白色
  --base-black-rgb: 0, 0, 0;  // 黑色
  --theme-color: rgb(var(--base-color-rgb));  // 主要颜色 102,141,248
  --theme-secondary-color: rgba(var(--base-color-rgb), 0.5);  // 次要颜色 102,141,248,0.5
  --color-black: rgb(var(--base-black-rgb));  // 黑色
  --color-white: rgb(var(--base-white-rgb));  // 白色
  --box-shadow-bottom: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);

  // 背景颜色
  --primary-bg-color: rgb(var(--base-bg-color-rgb));  // 主要背景颜色
  --secondary-bg-color: rgba(var(--base-bg-color-rgb), 0.5);  // 次要背景颜色
  --tertiary-bg-color: rgba(var(--base-black-rgb), 0.1);  // 三级背景颜色

  // 文本颜色
  --wot-color-title: var(--color-black);  // 主要文本颜色
  --wot-color-content: #262626;  // 主要内容文本颜色 262626
  --wot-color-secondary: #757575;  // 次要文本颜色 注释/补充/正文 757575
  --wot-color-aid: #8c8c8c;  // 辅助文本颜色 弱化信息，引导性/不可点文字 8c8c8c

  // 边框颜色
  --wot-color-border: rgba(var(--base-black-rgb), 0.1);  // 边框颜色 0,0,0,0.1
  --wot-color-border-light: rgba(var(--base-black-rgb), 0.1);  // 分割线颜色 0,0,0,0.1

  // 按钮样式
  --wot-button-primary-bg-color: var(--theme-color);  // 主要按钮背景颜色 102,141,248

  // 复选框样式
  --wot-checkbox-checked-color: var(--theme-color);  // 已选中复选框颜色 102,141,248

  // input 输入框样式
  --wot-input-bg: var(--primary-bg-color);  // 输入框背景颜色 27,209,165
  --wot-input-border-color: var(--wot-color-border);  // 输入框边框颜色 255,255,255,0.1
  --wot-input-icon-color: var(--wot-color-aid);  // 输入框图标颜色 255,255,255,0.1

  // 图标颜色
  --wot-color-icon: var(--color-white);  // 图标颜色 255,255,255

  // 日期时间选择器样式
  --wot-picker-region-bg-active-color: var(--theme-color);  // 日期范围颜色 102,141,248

  // 日期选择器样式
  --wot-calendar-active-color: var(--theme-color);  // 日期选择器选中颜色颜色 102,141,248

}
</style>
