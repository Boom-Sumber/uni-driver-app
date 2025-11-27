<script setup lang="ts">
import { useRouter } from 'uni-mini-router'
import { computed, onUnmounted, ref } from 'vue'
import { loginWithPsd, sendCode, verifyCode } from '@/api/methods/user'
import { useAuthStore } from '@/stores/authStore'

// 获取认证 store
const authStore = useAuthStore()

const router = useRouter()
// 标签数据类型定义
interface TabItem {
  name: string
  key: string
}

// 标签数据
const tabs = ref<TabItem[]>([
  { name: '密码登录', key: 'password' },
  { name: '验证码登录', key: 'verify' },
])

// 状态管理
const activeTab = ref<number>(0) // 0:密码登录, 1:验证码登录
const email = ref<string>('')
const password = ref<string>('')
const verifyCode_ = ref<string>('')
const showPassword = ref<boolean>(false)
const countdown = ref<number>(0)
const isEmailValid = ref<boolean>(false)
const isLoginLoading = ref<boolean>(false)
const isSendingCode = ref<boolean>(false)
const showEmailError = ref<boolean>(false)
const showPasswordError = ref<boolean>(false)
const showVerifyError = ref<boolean>(false)
const emailErrorMsg = ref<string>('请输入正确的邮箱格式')
const passwordErrorMsg = ref<string>('密码长度不少于6位')
const verifyCodeErrorMsg = ref<string>('请输入6位验证码')

// 定时器实例
let countdownTimer: number | null = null

// 切换标签
function switchTab(index: number) {
  activeTab.value = index
  // 切换时清空错误提示
  showEmailError.value = false
  showPasswordError.value = false
  showVerifyError.value = false
}

// 邮箱输入处理
function handleEmailInput(e: any) {
  const value = (e.detail.value as string) || ''
  email.value = value
  // 验证邮箱格式（简化版正则，可根据需求优化）
  const emailReg = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  isEmailValid.value = emailReg.test(value)
  showEmailError.value = Boolean(value && !isEmailValid.value)
}

// 切换密码可见性
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

// 获取验证码
async function getVerifyCode() {
  if (!isEmailValid.value) {
    uni.showToast({
      title: '请输入正确的邮箱地址',
      icon: 'none',
      duration: 2000,
    })
    return
  }

  try {
    isSendingCode.value = true

    // 调用 Supabase 发送验证码
    await sendCode(email.value)

    uni.showToast({
      title: '验证码已发送至您的邮箱',
      icon: 'none',
      duration: 2000,
    })

    // 启动倒计时
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  }
  catch (error: any) {
    console.error('发送验证码失败:', error)

    let errorMsg = '发送验证码失败，请重试'
    if (error.statusCode === 400) {
      errorMsg = '邮箱格式不正确或发送频率过高'
    }
    else if (error.statusCode === 429) {
      errorMsg = '请求过于频繁，请稍后再试'
    }

    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000,
    })
  }
  finally {
    isSendingCode.value = false
  }
}

// 登录按钮禁用状态计算
const isLoginDisabled = computed<boolean>(() => {
  if (activeTab.value === 0) {
    // 密码登录：邮箱和密码都不能为空且邮箱格式正确
    return !email.value || !password.value || !isEmailValid.value
  }
  else {
    // 验证码登录：邮箱和验证码都不能为空且邮箱格式正确、验证码为6位
    return !email.value || !verifyCode_.value || verifyCode_.value.length !== 6 || !isEmailValid.value
  }
})

// 表单验证
function validateForm(): boolean {
  let isValid = true

  // 验证邮箱
  if (!email.value) {
    showEmailError.value = true
    emailErrorMsg.value = '请输入邮箱'
    isValid = false
  }
  else if (!isEmailValid.value) {
    showEmailError.value = true
    emailErrorMsg.value = '请输入正确的邮箱格式'
    isValid = false
  }
  else {
    showEmailError.value = false
  }

  // 验证密码或验证码
  if (activeTab.value === 0) {
    // 密码验证
    if (!password.value) {
      showPasswordError.value = true
      passwordErrorMsg.value = '请输入密码'
      isValid = false
    }
    else if (password.value.length < 6) {
      showPasswordError.value = true
      passwordErrorMsg.value = '密码长度不少于6位'
      isValid = false
    }
    else {
      showPasswordError.value = false
    }
  }
  else {
    // 验证码验证
    if (!verifyCode_.value) {
      showVerifyError.value = true
      verifyCodeErrorMsg.value = '请输入验证码'
      isValid = false
    }
    else if (verifyCode_.value.length !== 6) {
      showVerifyError.value = true
      verifyCodeErrorMsg.value = '请输入6位验证码'
      isValid = false
    }
    else {
      showVerifyError.value = false
    }
  }

  return isValid
}

// 处理登录
async function handleLogin(): Promise<void> {
  // 表单验证
  if (!validateForm())
    return

  try {
    isLoginLoading.value = true

    let authResult: any

    if (activeTab.value === 0) {
      // 密码登录
      authResult = await loginWithPsd(email.value, password.value)
    }
    else {
      // 验证码登录
      authResult = await verifyCode(email.value, verifyCode_.value)
    }

    // 登录成功处理

    // 使用 authStore 存储认证信息
    authStore.setAuth(
      authResult.access_token,
      authResult.refresh_token,
      authResult.user,
      authResult.expires_at,
    )

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
    })

    // 跳转到首页或其他页面
    setTimeout(() => {
      router.pushTab({
        name: 'index',
      })
    }, 1500)
  }
  catch (error: any) {
    console.error('登录失败:', error)

    let errorMsg = '登录失败，请重试'

    // 根据错误状态码提供更具体的错误信息
    if (error.statusCode === 400) {
      if (activeTab.value === 0) {
        errorMsg = '邮箱或密码错误'
      }
      else {
        errorMsg = '验证码错误或已过期'
      }
    }
    else if (error.statusCode === 422) {
      errorMsg = '邮箱格式不正确'
    }
    else if (error.statusCode === 429) {
      errorMsg = '请求过于频繁，请稍后再试'
    }

    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000,
    })
  }
  finally {
    isLoginLoading.value = false
  }
}

// 页面卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<template>
  <view class="login-container">
    <!-- 顶部Logo和标题 -->
    <view class="login-header">
      <image class="login-logo" src="/static/logo.png" mode="widthFix" />
      <view class="login-title">
        欢迎登录
      </view>
      <view class="login-desc">
        Start your day with joy!
      </view>
    </view>

    <!-- 标签切换栏 -->
    <view class="tab-container">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        <span class="tab-text">{{ tab.name }}</span>
        <view class="tab-indicator" :class="{ active: activeTab === index }" />
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="form-container">
      <!-- 邮箱输入框（两种模式共用） -->
      <view class="form-item">
        <view class="input-wrapper">
          <wd-icon name="mail" size="36rpx" color="#b5b5b5" class="input-icon" />
          <input
            v-model="email"
            type="text"
            placeholder="请输入邮箱"
            placeholder-class="input-placeholder"
            @input="handleEmailInput"
          >
        </view>
        <view v-if="showEmailError" class="error-message">
          {{ emailErrorMsg }}
        </view>
      </view>

      <!-- 动态表单内容（根据选中的标签显示） -->
      <template v-if="activeTab === 0">
        <!-- 密码登录模式 -->
        <view class="form-item">
          <view class="input-wrapper">
            <wd-icon name="lock-on" size="36rpx" color="#b5b5b5" class="input-icon" />
            <input
              v-model="password"
              :type="(showPassword ? 'text' : 'password') as any"
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
            >
            <wd-icon
              :name="showPassword ? 'browse' : 'browse-off'"
              size="36rpx"
              color="#b5b5b5"
              class="toggle-icon"
              @click="togglePasswordVisibility"
            />
          </view>
          <view v-if="showPasswordError" class="error-message">
            {{ passwordErrorMsg }}
          </view>
        </view>
      </template>

      <template v-else>
        <!-- 验证码登录模式 - 输入框和按钮同一容器 -->
        <view class="form-item">
          <view class="verify-wrapper">
            <wd-icon name="check-rectangle" size="36rpx" color="#b5b5b5" class="input-icon" />
            <input
              v-model="verifyCode_"
              type="number"
              placeholder="请输入验证码"
              placeholder-class="input-placeholder"
              :maxlength="6"
              class="verify-input"
            >
            <button
              class="get-code-btn"
              :disabled="countdown > 0 || !isEmailValid"
              @click="getVerifyCode"
            >
              {{ isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
            </button>
          </view>
          <view v-if="showVerifyError" class="error-message">
            {{ verifyCodeErrorMsg }}
          </view>
        </view>
      </template>

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        :disabled="isLoginDisabled"
        :loading="isLoginLoading"
        style="margin-top: 40rpx;"
        @click="handleLogin"
      >
        <template v-if="isLoginLoading">
          <view class="loading-container">
            <span class="loading-text">登录中...</span>
          </view>
        </template>
        <template v-else>
          登录
        </template>
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/color.scss';

.login-container {
  min-height: 100vh;
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;

    .login-logo {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 20rpx;
    }

    .login-title {
      font-size: 36rpx;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 10rpx;
    }

    .login-desc {
      font-size: 24rpx;
      color: $text-light;
    }
  }

  .tab-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 60rpx;

    .tab-item {
      width: 180rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 20rpx;

      .tab-text {
        font-size: 28rpx;
        color: $text-gray;
        padding: 10rpx 0;
        transition: color 0.3s ease;
      }

      .tab-indicator {
        width: 60rpx;
        height: 6rpx;
        background-color: transparent;
        border-radius: 3rpx;
        transition: all 0.3s ease;
        margin-top: 5rpx;
      }

      &.active {
        .tab-text {
          color: $primary-color;
          font-weight: 500;
        }

        .tab-indicator {
          background-color: $primary-color;
          width: 80rpx;
        }
      }
    }
  }

  .form-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40rpx;

    .form-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12rpx;

      .input-wrapper {
        width: 100%;
        height: 96rpx;
        background-color: $white;
        border-radius: 48rpx;
        display: flex;
        align-items: center;
        padding: 0 30rpx;
        box-sizing: border-box;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease;

        &:focus-within {
          box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.15);
        }

        .input-icon {
          margin-right: 20rpx;
        }

        input {
          flex: 1;
          height: 100%;
          font-size: 28rpx;
          color: $text-color;
        }

        .toggle-icon {
          cursor: pointer;
        }
      }

      // 验证码输入框和按钮同一容器样式
      .verify-wrapper {
        width: 100%;
        height: 96rpx;
        background-color: $white;
        border-radius: 48rpx;
        display: flex;
        align-items: center;
        padding: 0 0 0 30rpx;
        box-sizing: border-box;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease;

        &:focus-within {
          box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.15);
        }

        .input-icon {
          margin-right: 20rpx;
          color: $primary-color;
        }

        .verify-input {
          flex: 1;
          height: 100%;
          font-size: 28rpx;
          color: $text-color;
        }

        .get-code-btn {
          min-width: 240rpx;
          height: 100%;
          background-color: $primary-light;
          color: $primary-color;
          border-top-right-radius: 48rpx;
          border-bottom-right-radius: 48rpx;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;

          font-size: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border: none;
          margin-left: 16rpx;

          &:disabled {
            background-color: #f0f2f5;
            color: $text-light;
          }
        }
      }

      .input-placeholder {
        color: $text-light;
        font-size: 26rpx;
      }

      .error-message {
        font-size: 22rpx;
        color: $error-color;
        padding-left: 30rpx;
      }
    }

    .login-btn {
      width: 100%;
      height: 108rpx;
      background-color: $primary-color;
      color: $white;
      border-radius: 54rpx;
      font-size: 32rpx;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 20rpx rgba(22, 119, 255, 0.3);
      transition: background-color 0.3s ease;

      &:disabled {
        background-color: #c9daf9;
        box-shadow: none;
      }

      .loading-container {
        display: flex;
        align-items: center;
        gap: 12rpx;
      }

      .loading-text {
        font-size: 28rpx;
      }
    }
  }
}

/* 适配小程序和H5的按钮样式重置 */
::v-deep button {
  padding: 0;
  line-height: normal;
}

::v-deep button::after {
  border: none;
}

/* 修复uni-icons垂直居中问题 */
::v-deep .uni-icons {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
