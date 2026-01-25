import { createRouter } from 'uni-mini-router'
// 引入uni-parse-pages
import pagesJsonToRoutes from 'uni-parse-pages'
import { refreshToken } from '@/apis/methods/auth'
// 导入pages.json
import pagesJson from '../pages.json'

const ignorePaths = ['/pages/auth/login', '/pages/register/register']
// 生成路由表
const routes = pagesJsonToRoutes(pagesJson)
const router = createRouter({
  routes: [...routes], // 路由表信息
})

router.beforeEach(async (to?: any, from?: any, next?: any) => {
  const isLoggedIn = await refreshToken()
  if (ignorePaths.includes(to.path)) {
    next()
  }
  else if (isLoggedIn) {
    next()
  }
  else {
    // 刷新token
    next({ path: `/pages/auth/login`, navType: 'replaceAll' })
  }
})
export default router
