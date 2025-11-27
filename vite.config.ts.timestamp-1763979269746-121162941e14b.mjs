// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import Uni from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/@uni-helper+plugin-uni@0.1._611969911d056661c327016d7764b73c/node_modules/@uni-helper/plugin-uni/src/index.js";
import Components from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.3_rollup@4.53.2/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
import { WotResolver } from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.3_rollup@4.53.2/node_modules/@uni-helper/vite-plugin-uni-components/dist/resolvers.mjs";
import { UniEchartsResolver } from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/uni-echarts@2.1.1_echarts@6.0.0_vue@3.4.21_typescript@5.9.3_/node_modules/uni-echarts/dist-resolver/index.mjs";
import { UniEcharts } from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/uni-echarts@2.1.1_echarts@6.0.0_vue@3.4.21_typescript@5.9.3_/node_modules/uni-echarts/dist-vite/index.mjs";
import { defineConfig } from "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/node_modules/.pnpm/vite@5.2.8_@types+node@24.10.1_sass@1.64.2_terser@5.44.1/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/%E6%A1%8C%E9%9D%A2/uni-driver-app/vite.config.ts";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  plugins: [
    // https://uni-helper.js.org/vite-plugin-uni-components
    Components({
      dts: true,
      resolvers: [UniEchartsResolver(), WotResolver()]
    }),
    // https://uni-echarts.xiaohe.ink
    UniEcharts(),
    // https://uni-helper.js.org/plugin-uni
    Uni()
  ],
  optimizeDeps: {
    exclude: [
      "uni-echarts"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTY4NENcdTk3NjJcXFxcdW5pLWRyaXZlci1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1Njg0Q1x1OTc2MlxcXFx1bmktZHJpdmVyLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovJUU2JUExJThDJUU5JTlEJUEyL3VuaS1kcml2ZXItYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5pbXBvcnQgVW5pIGZyb20gJ0B1bmktaGVscGVyL3BsdWdpbi11bmknXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktY29tcG9uZW50cydcbmltcG9ydCB7IFdvdFJlc29sdmVyIH0gZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuaW1wb3J0IHsgVW5pRWNoYXJ0c1Jlc29sdmVyIH0gZnJvbSAndW5pLWVjaGFydHMvcmVzb2x2ZXInXG5pbXBvcnQgeyBVbmlFY2hhcnRzIH0gZnJvbSAndW5pLWVjaGFydHMvdml0ZSdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIC8vIGh0dHBzOi8vdW5pLWhlbHBlci5qcy5vcmcvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHNcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGR0czogdHJ1ZSxcbiAgICAgIHJlc29sdmVyczogW1VuaUVjaGFydHNSZXNvbHZlcigpLCBXb3RSZXNvbHZlcigpXSxcbiAgICB9KSxcbiAgICAvLyBodHRwczovL3VuaS1lY2hhcnRzLnhpYW9oZS5pbmtcbiAgICBVbmlFY2hhcnRzKCksXG4gICAgLy8gaHR0cHM6Ly91bmktaGVscGVyLmpzLm9yZy9wbHVnaW4tdW5pXG4gICAgVW5pKCksXG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFtcbiAgICAgICd1bmktZWNoYXJ0cycsXG4gICAgXSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9RLFNBQVMsZUFBZSxXQUFXO0FBQ3ZTLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG1CQUFtQjtBQUM1QixTQUFTLDBCQUEwQjtBQUNuQyxTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQU53SCxJQUFNLDJDQUEyQztBQVF0TSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBO0FBQUEsSUFFUCxXQUFXO0FBQUEsTUFDVCxLQUFLO0FBQUEsTUFDTCxXQUFXLENBQUMsbUJBQW1CLEdBQUcsWUFBWSxDQUFDO0FBQUEsSUFDakQsQ0FBQztBQUFBO0FBQUEsSUFFRCxXQUFXO0FBQUE7QUFBQSxJQUVYLElBQUk7QUFBQSxFQUNOO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
