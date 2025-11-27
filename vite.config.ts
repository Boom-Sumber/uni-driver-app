import { fileURLToPath, URL } from 'node:url'
import Uni from '@uni-helper/plugin-uni'
import Components from '@uni-helper/vite-plugin-uni-components'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
import { UniEchartsResolver } from 'uni-echarts/resolver'
import { UniEcharts } from 'uni-echarts/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // https://uni-helper.js.org/vite-plugin-uni-components
    Components({
      dts: true,
      resolvers: [UniEchartsResolver(), WotResolver()],
    }),
    // https://uni-echarts.xiaohe.ink
    UniEcharts(),
    // https://uni-helper.js.org/plugin-uni
    Uni(),
  ],
  optimizeDeps: {
    exclude: [
      'uni-echarts',
    ],
  },
})
