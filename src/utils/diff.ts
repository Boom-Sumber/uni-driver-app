/**
 * 深拷贝（处理只读对象，返回可修改类型）
 */
export function deepClone<T>(obj: T | Readonly<T>): T {
  // 处理 undefined 和 null
  if (obj === undefined || obj === null) {
    return obj as T
  }

  if (typeof obj !== 'object') {
    return obj as T
  }

  if (obj instanceof Date) {
    return new Date(obj) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  // 处理普通对象
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    result[key] = deepClone(value)
  }
  return result as T
}

/**
 * 递归对比两个值，返回是否相等（支持数组/对象/只读类型）
 */
function isEqual<T>(a: T | Readonly<T>, b: T | Readonly<T>): boolean {
  if (a === b)
    return true
  if (typeof a !== typeof b)
    return false
  if (typeof a !== 'object' || a === null || b === null)
    return a === b

  // 数组对比
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false
    return a.every((item, index) => isEqual(item, b[index]))
  }

  // 对象对比（非数组）
  const keysA = Object.keys(a as Record<string, any>)
  const keysB = Object.keys(b as Record<string, any>)
  if (keysA.length !== keysB.length)
    return false
  return keysA.every(key => isEqual(
    (a as Record<string, any>)[key],
    (b as Record<string, any>)[key],
  ))
}

/**
 * 对比原始数据和修改后数据，提取变化字段（支持只读原始数据）
 * @param original 原始数据（可只读）
 * @param modified 修改后数据
 * @param ignoreFields 忽略字段
 * @returns 变化字段对象（Partial<T>）
 */
export function getDiff<T extends Record<string, unknown>>(original: T | Readonly<T>, modified: T, ignoreFields: (keyof T)[] = []): Partial<T> {
  const diff: Partial<T> = {}

  Object.entries(modified).forEach(([key, modifiedVal]) => {
    const keyTyped = key as keyof T
    if (ignoreFields.includes(keyTyped))
      return

    const originalVal = (original as T)[keyTyped] // 兼容只读对象的取值

    // 1. 原始数据中无该字段（新增）
    if (!(keyTyped in original)) {
      diff[keyTyped] = modifiedVal as T[keyof T]
      return
    }

    // 2. 深度对比值是否相等
    if (isEqual(originalVal, modifiedVal))
      return

    // 3. 引用类型（对象/数组）递归处理
    if (typeof modifiedVal === 'object' && modifiedVal !== null) {
      if (Array.isArray(modifiedVal)) {
        diff[keyTyped] = modifiedVal as T[keyof T]
      }
      else {
        const nestedDiff = getDiff(
          originalVal as Record<string, unknown> | Readonly<Record<string, unknown>>,
          modifiedVal as Record<string, unknown>,
          ignoreFields as string[],
        )
        if (Object.keys(nestedDiff).length > 0) {
          diff[keyTyped] = nestedDiff as T[keyof T]
        }
      }
      return
    }

    // 4. 基本类型：直接赋值
    diff[keyTyped] = modifiedVal as T[keyof T]
  })

  return diff
}
