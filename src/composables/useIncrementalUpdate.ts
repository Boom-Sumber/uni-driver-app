import type { Ref, UnwrapRef, WatchSource } from 'vue'
import { ref, watch } from 'vue' // 引入UnwrapRef
import { deepClone, getDiff } from '@/utils/diff'

/**
 * 组合式API：增量更新（修复UnwrapRef类型冲突）
 * @param initialData 初始数据（后端查询结果）
 * @param ignoreFields 忽略字段
 */
export function useIncrementalUpdate<T extends Record<string, unknown>>(initialData: T, ignoreFields: (keyof T)[] = []) {
  // 检查 initialData 是否有效
  if (!initialData || typeof initialData !== 'object') {
    console.error('useIncrementalUpdate: initialData 无效', initialData)
    throw new Error('initialData 必须是有效的对象')
  }
  try {
    // 原始数据（只读，深拷贝避免修改）
    const originalData = ref<T>(deepClone(initialData)) as Ref<Readonly<T>>
    // 可修改的数据（组件绑定用）
    const formData = ref<T>(deepClone(initialData)) as Ref<T>
    // 变化字段：明确类型为 UnwrapRef<Partial<T>>，适配ref解包
    const diffData = ref<Partial<T>>({}) as Ref<UnwrapRef<Partial<T>>>

    // 监听formData变化，计算差异（关键：用Object.assign适配解包类型）
    watch(
      formData as WatchSource<T>,
      (newVal) => {
        try {
          // 核心修复：用Object.assign将Partial<T>合并到diffData.value（适配UnwrapRef）
          const newDiff = getDiff(originalData.value, newVal, ignoreFields)

          diffData.value = Object.assign({}, newDiff) as UnwrapRef<Partial<T>>
        }
        catch (error) {
          console.error('useIncrementalUpdate: 计算差异失败', error)
          throw error
        }
      },
      { deep: true, immediate: true },
    )

    // 重置表单
    const resetForm = () => {
      formData.value = deepClone(originalData.value)
    }

    // 手动刷新差异
    const refreshDiff = () => {
      const newDiff = getDiff(originalData.value, formData.value, ignoreFields)
      diffData.value = Object.assign({}, newDiff) as UnwrapRef<Partial<T>>
    }

    // 更新原始数据（用于编辑模式重新初始化）
    const updateOriginalData = (newData: T) => {
      originalData.value = deepClone(newData)
      formData.value = deepClone(newData)
    }

    return {
      formData, // Ref<T>
      diffData, // Ref<UnwrapRef<Partial<T>>>
      resetForm,
      refreshDiff,
      updateOriginalData,
    }
  }
  catch (error) {
    console.error('useIncrementalUpdate: 初始化失败', error)
    throw error
  }
}
