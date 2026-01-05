import { createRouter } from 'uni-mini-router'
// 引入uni-parse-pages
import pagesJsonToRoutes from 'uni-parse-pages'
import { isLoggedIn, refreshAccessToken } from '@/utils/tokenManager'
// 导入pages.json
import pagesJson from '../pages.json'

const ignorePaths = ['/pages/auth/login', '/pages/register/register']
// 生成路由表
const routes = pagesJsonToRoutes(pagesJson)
const router = createRouter({
  routes: [...routes], // 路由表信息
})
router.beforeEach(async (to?: any, from?: any, next?: any) => {
  const { isSignedIn, expireAt } = isLoggedIn()
  if (ignorePaths.includes(to.path) || isSignedIn) {
    next()
  }
  else {
    // 刷新token
    try {
      if (expireAt < 0) {
        next({ path: '/pages/auth/login', navType: 'replaceAll' })
        return
      }
      const isSuccess = await refreshAccessToken()
      if (!isSuccess) {
        next({ path: '/pages/auth/login', navType: 'replaceAll' })
        return
      }
      next()
    }
    catch (error) {
      next({ path: '/pages/auth/login', navType: 'replaceAll' })
      throw error
    }
  }
})
export default router
