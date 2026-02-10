<script setup lang="ts">
import type { User } from 'supabase-wechat-stable-v2'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { ref } from 'vue'
import { useMessage, useToast } from 'wot-design-uni'
import { logout, updatePassword } from '@/apis/methods/auth'
import { clearAllStorage, getStorage } from '@/utils/storage'

const router = useRouter()

const toast = useToast()
const updatePwdMessageBox = useMessage('update-pwd-message-box')
const message = useMessage()
const newPwd = ref('')
const confirmPwd = ref('')
// 模拟用户信息（实际从缓存/接口获取）
const userInfo = ref({
  avatar: '/static/avatar.jpg', // 默认头像，需自行准备
  account: '未知用户', // 登录账号，替换为真实数据
})
onLoad(async () => {
  const user = getStorage('app_user') as User
  if (user) {
    userInfo.value.account = user.email || '未知用户'
  }
})

// 处理修改密码逻辑
function handleChangePwd() {
  updatePwdMessageBox.confirm({
    title: '修改密码',
  }).then(async () => {
    if (newPwd.value !== confirmPwd.value) {
      toast.error('两次输入密码不一致')
      return
    }
    if (newPwd.value.length < 6) {
      toast.error('密码长度不能小于6位')
      return
    }
    toast.loading('修改密码中...')
    try {
      const isSuccess = await updatePassword(
        newPwd.value,
      )
      if (isSuccess) {
      // 提示修改成功
        setTimeout(() => {
          toast.success('修改密码成功, 请重新登录')
        }, 2000)
        // 跳转到登录页
        router.replaceAll({ name: 'login' })
      }
      else {
        toast.error('修改密码失败')
      }
    }
    catch (error) {
      toast.error('修改密码失败，请稍后重试')
      throw error
    }
  })
}

// 处理退出登录逻辑
function handleLogout() {
  message.confirm({
    title: '提示',
    msg: '确定要退出登录吗？',
  }).then(async () => {
    toast.loading('退出登录中...')
    try {
      const isSuccess = await logout()
      if (isSuccess) {
      // 提示退出成功
        toast.success('退出登录成功, 请重新登录')
        // 跳转到登录页
        setTimeout(() => {
          router.replaceAll({ name: 'login' })
        }, 2000)
        // 清除登录态缓存
        clearAllStorage()
      }
      else {
        toast.error('退出登录失败')
      }
    }
    catch (error) {
      toast.error('退出登录失败，请稍后重试')
      throw error
    }
  })
}
</script>

<template>
  <wd-toast />
  <wd-message-box />
  <wd-message-box selector="update-pwd-message-box">
    <view class="message-content">
      <wd-input v-model="newPwd" show-password placeholder="请输入新密码" />
      <wd-input v-model="confirmPwd" show-password placeholder="请确认新密码" />
    </view>
  </wd-message-box>
  <view class="my-container">
    <!-- 顶部用户信息卡片 -->
    <wd-card title="用户信息" custom-class="card">
      <view class="user-info">
        <!-- 头像 -->
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
        <!-- 登录账号 -->
        <view class="account">
          {{ userInfo.account }}
        </view>
      </view>
      <view class="func-buts">
        <wd-button type="primary" @click="handleChangePwd">
          修改密码
        </wd-button>
        <wd-button type="error" @click="handleLogout">
          退出登录
        </wd-button>
      </view>
    </wd-card>
  </view>
</template>

<style scoped>
.message-content {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding: 30rpx;

}
/* 页面容器 */
.my-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx 20rpx 20rpx 20rpx;
  box-sizing: border-box;
}

/* 用户信息卡片 */
:deep(.card) {
  padding-top: 30rpx;
  padding-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx var(--wot-color-border);
}
.func-buts {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  gap: 30rpx;
}

/* 用户信息区域 */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60rpx;
  padding-bottom: 60rpx;
}

/* 头像样式 */
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid #eee;
  margin-bottom: 20rpx;
}

/* 账号文本 */
.account {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}
</style>
