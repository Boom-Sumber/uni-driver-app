import * as Pinia from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'
import './router/tabBarInterceptor'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  app.use(router)
  return {
    app,
    Pinia,
  }
}
