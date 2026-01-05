const whiteList = [
  '/pages/index',
  '/pages/tripManager/tripManager',
  '/pages/my/my',
  '/pages/data/data',
]

uni.addInterceptor('switchTab', {
  // tabbar页面跳转前进行拦截
  invoke(e) {
    if (!uni.getStorageSync('token_expire_at') && whiteList.includes(e.url)) {
      uni.$emit('jumpToLogin', true)
      return false
    }
    else {
      return true
    }
  },
})
