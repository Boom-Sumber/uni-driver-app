import { customRef } from 'vue'

/**
 * 防抖 ref
 * @param value 初始值
 * @param delay 防抖延迟时间，默认 500ms
 * @returns 防抖 ref 对象
 */
export function debounceRef<T>(value: T, delay = 500) {
  let timer: ReturnType<typeof setTimeout>
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    },
  }))
}
