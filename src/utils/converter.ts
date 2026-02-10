/**
 * px转rpx
 * @param px - 设计稿中的px值（通常设计稿宽度为750px）
 * @param designWidth - 设计稿宽度，默认为750
 * @returns rpx值
 */
export function pxToRpx(px: number) {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth
  return Math.floor(px * (750 / screenWidth))
}
/**
 * rpx转px
 * @param rpx - rpx值
 * @returns px值
 */
export function rpxToPx(rpx: number) {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.screenWidth
  return Math.floor(rpx * (screenWidth / 750))
}
