// stores/requestStore.ts
import { defineStore } from 'pinia'

interface RequestData {
  data: any
  error: any
  status: 'pending' | 'fulfilled' | 'rejected'
}

export const useRequestStore = defineStore('request', {
  state: () => ({
    // 只存储数据和状态，不存储函数
    requests: new Map<string, RequestData>(),
  }),

  actions: {
    // 创建请求记录
    createRequest(requestKey: string) {
      const request: RequestData = {
        data: null,
        error: null,
        status: 'pending',
      }

      this.requests.set(requestKey, request)
      return request
    },

    // 更新请求状态（成功）
    resolveRequest(requestKey: string, data: any) {
      const request = this.requests.get(requestKey)
      if (request) {
        request.data = data
        request.status = 'fulfilled'
        request.error = null
      }
    },

    // 更新请求状态（失败）
    rejectRequest(requestKey: string, error: any) {
      const request = this.requests.get(requestKey)
      if (request) {
        request.error = error
        request.status = 'rejected'
        request.data = null
      }
    },

    // 获取请求数据
    getRequest(requestKey: string): RequestData | undefined {
      return this.requests.get(requestKey)
    },

    // 清理请求
    clearRequest(requestKey: string) {
      this.requests.delete(requestKey)
    },

    // 等待请求完成（返回一个Promise）
    waitForRequest(requestKey: string, timeout: number = 10000): Promise<any> {
      return new Promise((resolve, reject) => {
        const startTime = Date.now()

        const checkRequest = () => {
          const request = this.requests.get(requestKey)

          if (!request) {
            reject(new Error('Request not found'))
            return
          }
          if (request.status === 'pending') {
            // 还在等待中
            if (Date.now() - startTime > timeout) {
              reject(new Error('Request timeout'))
              return
            }

            // 轮询检查
            setTimeout(checkRequest, 100)
          }
          else {
            resolve(this.getRequest(requestKey))
          }
        }

        checkRequest()
      })
    },
  },
})
