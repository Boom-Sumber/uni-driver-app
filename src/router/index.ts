import { createRouter } from 'uni-mini-router'
// 引入uni-parse-pages
import pagesJsonToRoutes from 'uni-parse-pages'
import { isLoggedIn } from '@/utils/tokenManager'
// 导入pages.json
import pagesJson from '../pages.json'
// 生成路由表
const routes = pagesJsonToRoutes(pagesJson)
const router = createRouter({
  routes: [...routes], // 路由表信息
})
router.beforeEach((to, from, next) => {
  if (to.path === '/pages/auth/login') {
    next()
  }
  else if (isLoggedIn()) {
    next()
  }
  else {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    next({
      path: '/pages/auth/login',
    })
  }
})
export default router
