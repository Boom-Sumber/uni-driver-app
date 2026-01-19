<script setup lang="ts">
import { onError } from '@dcloudio/uni-app'

onError((err) => {
  console.error('错误捕获', err)
})
</script>

<style lang="scss">
  @import './static/iconfont/iconfont.css';
  @import './styles/theme.scss';
:root,
page {
  --base-color-rgb: 102,141,248;  // 主要颜色 499eff
  --base-bg-color-rgb: 255,255,255;  // 主要背景颜色 27,209,165
  --base-white-rgb: 255,255,255;  // 白色
  --base-black-rgb: 0, 0, 0;  // 黑色
  --theme-color: rgb(var(--base-color-rgb));  // 主要颜色 27,209,165
  --theme-secondary-color: rgba(var(--base-color-rgb), 0.5);  // 次要颜色 27,209,165,0.5
  --color-black: rgb(var(--base-black-rgb));  // 黑色
  --color-white: rgb(var(--base-white-rgb));  // 白色
  --box-shadow-bottom: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);

  // 背景颜色
  --primary-bg-color: rgb(var(--base-bg-color-rgb));  // 主要背景颜色
  --secondary-bg-color: rgba(var(--base-bg-color-rgb), 0.5);  // 次要背景颜色

  // 文本颜色
  --wot-color-title: var(--color-black);  // 主要文本颜色
  --wot-color-content: #262626;  // 主要内容文本颜色 262626
  --wot-color-secondary: #757575;  // 次要文本颜色 注释/补充/正文 595959
  --wot-color-aid: #8c8c8c;  // 辅助文本颜色 弱化信息，引导性/不可点文字 8c8c8c

  // 边框颜色
  --wot-color-border: rgba(var(--base-black-rgb), 0.1);  // 边框颜色 0,0,0,0.1
  --wot-color-border-light: rgba(var(--base-black-rgb), 0.1);  // 分割线颜色 0,0,0,0.1

  // 按钮样式
  --wot-button-primary-bg-color: var(--theme-color);  // 主要按钮背景颜色 27,209,165

  // 复选框样式
  --wot-checkbox-checked-color: var(--theme-color);  // 已选中复选框颜色 27,209,165

  // input 输入框样式
  --wot-input-bg: var(--primary-bg-color);  // 输入框背景颜色 27,209,165
  --wot-input-border-color: var(--wot-color-border);  // 输入框边框颜色 255,255,255,0.1
  --wot-input-icon-color: var(--wot-color-aid);  // 输入框图标颜色 255,255,255,0.1

  // 图标颜色
  --wot-color-icon: var(--color-white);  // 图标颜色 255,255,255
}
</style>
