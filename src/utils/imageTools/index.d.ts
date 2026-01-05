// src/utils/imageTools.d.ts
declare module '@/utils/imageTools/index.js' {
  /**
   * 将文件路径转换为 base64
   * @param path 文件路径（本地路径或网络路径）
   * @returns Promise，解析为 base64 字符串（格式：data:image/xxx;base64,...）
   */
  export function pathToBase64(path: string): Promise<string>

  /**
   * 将 base64 转换为本地文件路径
   * @param base64 base64 字符串（格式：data:image/xxx;base64,...）
   * @returns Promise，解析为本地文件路径
   */
  export function base64ToPath(base64: string): Promise<string>
}
