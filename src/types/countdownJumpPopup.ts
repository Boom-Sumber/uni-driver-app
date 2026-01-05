import type { NAVTYPE } from 'uni-mini-router'

export interface CountdownJumpPopupProps {
  title?: string
  content?: string
  jumpNowBtnText?: string // 立即跳转按钮文本
  targetPageName?: string // 目标页面名称,用于渲染
  routerName?: string // 目标页面路径名
  countdown?: number // 倒计时秒数（≥0）
  closable?: boolean // 是否显示关闭按钮
  closeOnClickModal?: boolean // 点击遮罩是否关闭
  showJumpNowBtn?: boolean // 是否显示“立即跳转”按钮
  routeType?: NAVTYPE // 路由跳转类型（PUSH/REPLACE_ALL/REPLACE/BACK）
  modelValue: boolean // 控制弹窗显示隐藏
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left' // APP 端弹窗位置
  modal?: boolean // 是否显示遮罩
  zIndex?: number // 弹窗层级
}
