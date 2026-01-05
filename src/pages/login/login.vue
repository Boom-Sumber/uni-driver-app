<script setup lang="ts">
import { computed, ref } from 'vue'

const loginMode = ref('password')
const sliderStyle = computed(() => ({
  transform: loginMode.value === 'password' ? 'translateX(0)' : 'translateX(100%)',
}))
</script>

<template>
  <view class="login-form-wrap">
    <view class="form-mode">
      <view class="switch-slider" :style="sliderStyle" />
      <view
        class="tab"
        :class="{ active: loginMode === 'password' }"
        @click="loginMode = 'password'"
      >
        密码登录
      </view>
      <view
        class="tab"
        :class="{ active: loginMode === 'code' }"
        @click="loginMode = 'code'"
      >
        验证码登录
      </view>
    </view>
  </view>
</template>

<style scoped>
  .login-form-wrap {
  background-color: #ffffff;
  padding: 40rpx 50rpx;

}
  .form-mode {
  display: flex;
  padding: 6rpx;
  position: relative;
  background-color: #d1d1d1;
  border-radius: 20rpx;
  height: 90rpx;
}

.switch-slider {
  position: absolute;
  width: calc(50% - 6rpx);
  height: calc(100% - 12rpx);
  background-color: #ffffff;
  transition: transform 0.3s ease;
  border-radius: 20rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.tab.active {
  color: #1890ff;
  font-weight: 500;
}
</style>
