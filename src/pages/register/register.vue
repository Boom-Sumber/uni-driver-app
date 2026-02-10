<script setup lang="ts">
import { useRouter } from 'uni-mini-router'
import { computed, ref } from 'vue'
import { dayjs, useToast } from 'wot-design-uni'
import { registerByUsername, sendVerifyCode, verifyCode } from '@/apis/methods/auth'

const toast = useToast()
const router = useRouter()

// 定义登录模式类型
type registerType = 'username' | 'email'

// 响应式数据
const registerMode = ref<registerType>('username') // 登录模式
const account = ref<string>('') // 用户名/邮箱（密码登录）
const email = ref<string>('') // 邮箱（验证码登录）
const password = ref<string>('') // 密码（密码登录）
const confirmPassword = ref<string>('') // 确认密码（密码登录）
const code = ref<string>('') // 验证码
const countdown = ref<number>(0) // 验证码倒计时
const agreementChecked = ref<boolean>(false) // 协议勾选状态

const sliderStyle = computed(() => {
  return {
    transform: registerMode.value === 'username'
      ? 'translateX(0)'
      : 'translateX(100%)',
  }
})

/**
 * 获取验证码
 */
async function handleGetCode(): Promise<void> {
  // 验证邮箱格式
  if (!validateEmail(email.value)) {
    toast.error('请输入正确的邮箱地址')
    return
  }

  // 验证通过后，发送验证码请求
  try {
    toast.loading('发送中...')
    await sendVerifyCode(email.value)
  }
  catch (error) {
    toast.error('发送验证码失败，请稍后重试')
    throw error
  }
  finally {
    toast.close()
  }

  // 启动倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  // 模拟发送验证码请求
  toast.success('验证码已发送至您的邮箱，请注意查收')
}

/**
 * 登录处理
 */
async function handleRegister(): Promise<void> {
  // 先验证输入，再显示loading
  if (!validateInputs()) {
    return
  }

  toast.loading('登录中...')

  try {
    const result = await performRegister()
    if (result) {
      toast.success('注册成功')
      const startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD')
      const endDate = dayjs().format('YYYY-MM-DD')
      setTimeout(() => {
        router.replaceAll({ name: 'login', params: { startDate, endDate } })
      }, 1500)
    }
  }
  catch (error) {
    toast.error('注册失败，请稍后重试')
    throw error
  }
  finally {
    toast.close()
  }
}

// 验证输入函数
function validateInputs(): boolean {
  // 验证协议勾选（公共验证）
  if (!agreementChecked.value) {
    toast.error('请阅读并同意用户协议和隐私政策')
    return false
  }

  if (registerMode.value === 'username') {
    return validateUsernameInputs()
  }
  else {
    return validateCodeInputs()
  }
}

function validateUsernameInputs(): boolean {
  if (!account.value) {
    toast.error('请输入用户名')
    return false
  }

  // 邮箱格式验证
  if (account.value.includes('@')) {
    toast.error('用户名不能包含邮箱格式')
    return false
  }

  if (!password.value) {
    toast.error('请输入密码')
    return false
  }
  if (password.value !== confirmPassword.value) {
    toast.error('两次输入密码不一致')
    return false
  }

  return true
}

function validateCodeInputs(): boolean {
  if (!email.value) {
    toast.error('请输入邮箱地址')
    return false
  }

  if (!validateEmail(email.value)) {
    toast.error('请输入正确的邮箱地址')
    return false
  }

  if (!code.value || code.value.length !== 6) {
    toast.error('请输入6位验证码')
    return false
  }

  return true
}

// 执行注册
async function performRegister(): Promise<boolean> {
  if (registerMode.value === 'username') {
    // 验证用户名输入不通过，直接返回false
    if (!validateUsernameInputs()) {
      return false
    }
    // 直接调用用户名注册方法（异常由你外部的处理逻辑承接）
    try {
      const result = await registerByUsername(account.value, password.value)
      return result
    }
    catch (error) {
      toast.error('注册失败，请稍后重试')
      throw error
    }
  }
  else {
    // 验证验证码输入不通过，直接返回false
    if (!validateCodeInputs()) {
      return false
    }
    // 直接调用验证码验证方法并转为布尔值（异常由你外部的处理逻辑承接）
    try {
      const result = await verifyCode(email.value, code.value)
      return result
    }
    catch (error) {
      toast.error('验证码验证失败，请稍后重试')
      throw error
    }
  }
}

/**
 * 验证邮箱格式（返回布尔值）
 */
function validateEmail(value: string): boolean {
  // 通用邮箱正则验证
  const reg = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  // 密码登录时验证account（用户名/邮箱）：如果是邮箱则验证格式，用户名不做格式限制
  if (registerMode.value === 'username') {
    return value ? (value.includes('@') ? reg.test(value) : true) : false
  }
  // 验证码登录时验证email
  return reg.test(value)
}

/**
 * 查看用户协议
 */
function handleAgreement(): void {
  toast.show('查看用户协议')
}

/**
 * 查看隐私政策
 */
function handlePrivacy(): void {
  toast.show('查看隐私政策')
}
</script>

<template>
  <wd-toast loading-color="#668DF8" />
  <view class="register-page">
    <view class="back-btn-container">
      <wd-icon name="arrow-left" size="30px" custom-class="back-btn" color="rgba(var(--base-white-rgb),0.8)" @click="router.back()" />
    </view>
    <!-- 头部Logo区域 -->
    <view class="register-header">
      <!-- Logo容器 -->
      <view class="logo-box">
        <wd-icon class-prefix="icon" name="songhuozhong" size="48" color="rgba(var(--base-white-rgb),0.8)" />
      </view>
      <text class="register-title">
        用户注册
      </text>
      <text class="register-subtitle">
        请使用您的邮箱注册您的账户
      </text>
    </view>

    <!-- 登录表单区域 -->
    <view class="register-form-wrap">
      <view class="form-mode">
        <view class="switch-slider" :style="sliderStyle" />
        <view
          class="tab"
          :class="{ active: registerMode === 'username' }"
          @click="registerMode = 'username'"
        >
          用户名注册
        </view>
        <view
          class="tab"
          :class="{ active: registerMode === 'email' }"
          @click="registerMode = 'email'"
        >
          邮箱注册
        </view>
      </view>
      <!-- 登录方式切换：添加动画过渡的外层容器 -->

      <!-- 用户名注册：用户名 -->
      <view v-if="registerMode === 'username'" class="form-item">
        <wd-input
          v-model="account"
          prefix-icon="user"
          type="text"
          placeholder="请输入用户名"
          placeholder-style="font-size: 26rpx;"
          clearable
          custom-class="input-box"
          no-border
        />
      </view>

      <!-- 邮箱登录：邮箱输入框 -->
      <view v-if="registerMode === 'email'" class="form-item">
        <wd-input
          v-model="email"
          prefix-icon="mail"
          type="text"
          placeholder="请输入邮箱地址"
          placeholder-style="font-size: 26rpx;"
          clearable
          custom-class="input-box"
          no-border
        />
      </view>

      <!-- 密码登录：密码输入框 -->
      <view v-if="registerMode === 'username'" class="form-item">
        <wd-input
          v-model="password"
          prefix-icon="lock-on"
          type="nickname"
          show-password
          placeholder="请输入密码"
          placeholder-style="font-size: 26rpx;"
          clearable
          custom-class="input-box"
          no-border
        />
      </view>

      <!-- 密码登录：密码输入框 -->
      <view v-if="registerMode === 'username'" class="form-item">
        <wd-input
          v-model="confirmPassword"
          prefix-icon="lock-on"
          type="nickname"
          show-password
          placeholder="请确认密码"
          placeholder-style="font-size: 26rpx;"
          clearable
          custom-class="input-box"
          no-border
        />
      </view>

      <!-- 验证码登录：验证码输入项 -->
      <view v-if="registerMode === 'email'" class="form-item code-item">
        <wd-input
          v-model="code"
          prefix-icon="code"
          type="text"
          placeholder="请输入验证码"
          placeholder-style="font-size: 26rpx;"
          :maxlength="6"
          clearable
          custom-class="input-box code-input"
          no-border
        />
        <wd-button
          custom-class="get-code-btn"
          style="height: 80rpx; border-radius: 24rpx; transition: all 0.2s ease; font-size: 26rpx;"
          :disabled="countdown > 0 || !validateEmail(email)"
          @click="handleGetCode"
        >
          {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
        </wd-button>
      </view>

      <!-- 登录按钮 -->
      <wd-button
        custom-class="register-btn"
        style="height: 80rpx; border-radius: 24rpx; transition: all 0.2s ease;"
        block
        @click="handleRegister"
      >
        完成注册
      </wd-button>

      <!-- 用户协议勾选 -->
      <view class="agreement-wrap">
        <wd-checkbox v-model="agreementChecked" shape="square" />
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click="handleAgreement">
            《用户协议》
          </text>
          和
          <text class="link" @click="handlePrivacy">
            《隐私政策》
          </text>
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
/* 页面整体样式 */
.register-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--theme-color) 0%, #9ab3f9 100%);
  box-sizing: border-box;
}

.back-btn-container {
  height: 80rpx;
}
:deep(.back-btn) {
  position: absolute;
  top: 120rpx;
  left: 35rpx;
  z-index: 100;
}

/* 头部Logo区域 */
.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  padding-bottom: 60rpx;
}

.logo-box {
  width: 130rpx;
  height: 130rpx;
  background-color: var(--theme-color);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(var(--base-bg-color-rgb),0.5);
}

.register-title {
  font-size: 32rpx;
  color: rgba(var(--base-white-rgb), 0.8);
  margin-bottom: 12rpx;
  font-weight: 500;
}

.register-subtitle {
  font-size: 24rpx;
  color: rgba(var(--base-white-rgb), 0.5);
}

/* 表单区域 */
.register-form-wrap {
  flex-grow: 1;
  background-color: var(--primary-bg-color);
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  padding: 40rpx 50rpx;
}

.form-mode {
  display: flex;
  padding: 6rpx;
  position: relative;
  background-color: rgba(var(--base-black-rgb), 0.1);
  border-radius: 20rpx;
  height: 80rpx;
}

.switch-slider {
  position: absolute;
  width: calc(50% - 6rpx);
  height: calc(100% - 12rpx);
  background-color: var(--primary-bg-color);
  transition: transform 0.3s ease;
  border-radius: 20rpx;
}

.tab {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--wot-color-secondary);
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.tab.active {
  color: var(--theme-color);
  font-weight: 500;
}

/* 表单项：放大间距（从30rpx改为50rpx），设置相对定位 */
.form-item {
  /* 关键：增大输入框间距 */
  margin-top: 50rpx;
  position: relative;
}

/* 输入框：强化圆角边框，统一样式 */
:deep(.input-box) {
  display: flex;
  border: 1rpx solid var(--wot-input-border-color);
  border-radius: 24rpx;
  height: 80rpx;
  font-size: 26rpx;
  align-items: center;
  padding: 0 24rpx;
}
:deep(.input-box:focus-within) {
  border:2rpx solid var(--theme-color);
  box-shadow: 0px 0px 10rpx var(--theme-secondary-color);
}

/* 验证码输入项 */
.code-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

:deep(.get-code-btn) {
  box-shadow: var(--box-shadow-bottom);
}

/* 登录按钮 */
:deep(.register-btn) {
  margin-top: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: var(--box-shadow-bottom);
}

/* 协议勾选区域 */
.agreement-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--wot-color-border);
}

.agreement-text {
  font-size: 22rpx;
  color: var(--wot-color-secondary);
  line-height: 1.5;
  margin-top: 5rpx;
}

.link {
  color: var(--theme-color);
}
</style>
