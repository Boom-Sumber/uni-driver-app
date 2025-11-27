<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { isLoggedIn } from '@/utils/tokenManager'

const router = useRouter()

onLoad(() => {
  setTimeout(() => {
    if (isLoggedIn()) {
      router.replaceAll({
        name: 'index',
      })
    }
    else {
      router.replaceAll({
        name: 'login',
      })
    }
  }, 2000)
})
</script>

<template>
  <view class="start">
    <image class="logo" src="/static/logo.png" />
    <view class="start-title">
      欢迎来到司机端
    </view>
    <view class="start-desc">
      为您提供安全、便捷的服务
    </view>
  </view>
</template>

<style scoped lang="scss">
@import '@/styles/color.scss';
.start {
  height: 100vh;
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 60rpx;
  }
  .start-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-color;
    margin-bottom: 30rpx;
  }
  .start-desc {
    font-size: 24rpx;
    font-weight: 400;
    color: $text-color;
  }
}
</style>
