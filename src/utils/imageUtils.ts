import { getOCR } from '@/api/methods/ocr'

/**
 * 图片来源类型枚举
 */
export type ImageSourceType = 'camera' | 'gallery'

export async function getImageOCR(sourceType: ImageSourceType) {
  const base64Str = await getImageBase64(sourceType)
  const ocr = await getOCR(base64Str)
  return ocr
}

uni.addInterceptor('request', {
  invoke: (options) => {
    console.warn('请求拦截器', options)
  },
})

/**
 * 统一获取图片Base64函数
 * @param sourceType 图片来源：camera（相机）/ gallery（相册）
 * @returns Promise<string> 图片Base64字符串（含data:image/jpeg;base64,前缀）
 */
export async function getImageBase64(sourceType: ImageSourceType): Promise<string> {
  // 1. 参数校验
  if (!['camera', 'gallery'].includes(sourceType)) {
    throw new Error('sourceType参数错误，仅支持 camera 或 gallery')
  }

  try {
    // 3. 根据来源获取图片路径
    const imagePath = sourceType === 'camera'
      ? await takePhoto() // 相机拍照获取路径
      : await selectGalleryImage() // 相册选择获取路径

    // 4. 转换为Base64
    const base64Str = await imageToBase64(imagePath)

    return base64Str as string
  }
  catch (error) {
    uni.hideLoading()
    const errMsg = error instanceof Error ? error.message : String(error)
    uni.showToast({ title: `失败：${errMsg}`, icon: 'none', duration: 3000 })
    throw new Error(`获取图片Base64失败：${errMsg}`)
  }
}

// ---------------------- 以下是依赖的辅助函数 ----------------------

/**
 * 按需检查权限（相机/相册）
 * @param sourceType 图片来源
 */
// function checkRequiredPermissions(sourceType: ImageSourceType): Promise<void> {
//   return new Promise((resolve, reject) => {
//     let permissions: string[] = []
//     if (sourceType === 'camera') {
//       // 相机需要：相机权限 + 存储权限（兼容）
//       permissions = [
//         'android.permission.CAMERA',
//         'android.permission.READ_MEDIA_IMAGES', // Android13+图片权限
//         'android.permission.WRITE_EXTERNAL_STORAGE', // 低版本存储
//       ]
//     }
//     else {
//       // 相册需要：图片访问权限
//       permissions = [
//         'android.permission.READ_MEDIA_IMAGES',
//         'android.permission.READ_EXTERNAL_STORAGE',
//       ]
//     }

//     // 5+ App权限申请
//     plus.android.requestPermissions(
//       permissions,
//       (res: { granted: string[], deniedPresent: string[], deniedAlways: string[] }) => {
//         if (res.deniedPresent.length > 0 || res.deniedAlways.length > 0) {
//           const deniedPerms = res.deniedPresent.concat(res.deniedAlways).join(', ')
//           reject(new Error(`缺少必要权限：${deniedPerms}，请前往设置开启`))
//           return
//         }
//         resolve()
//       },
//       (err: any) => reject(new Error(`权限申请异常：${JSON.stringify(err)}`)),
//     )
//   })
// }

/**
 * 相机拍照：返回图片私有路径（适配Android10+）
 */
function takePhoto(): Promise<string> {
  return new Promise((resolve, reject) => {
    const camera = plus.camera.getCamera(1) // 1=后置摄像头（0=前置）
    const options = {
      filename: `_doc/camera/${Date.now()}.jpg`, // 应用私有路径（避开分区存储）
      format: 'jpg',
      quality: 80, // 拍照质量（1-100）
    }

    // 调用相机拍照
    camera.captureImage(
      (filePath: string) => {
        // 解析真实本地路径
        plus.io.resolveLocalFileSystemURL(
          filePath,
          entry => resolve(entry.toLocalURL()),
          err => reject(new Error(`解析拍照路径失败：${JSON.stringify(err)}`)),
        )
      },
      () => {
        uni.$emit('cameraError', true)
      },
      options,
    )
  })
}

/**
 * 相册选择图片：返回图片路径（适配分区存储）
 */
function selectGalleryImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    plus.gallery.pick(
      (res: string | string[]) => {
        const filePath = Array.isArray(res) ? res[0] : res
        if (!filePath) {
          reject(new Error('未选择任何图片'))
          return
        }
        // 解析真实本地路径
        plus.io.resolveLocalFileSystemURL(
          filePath,
          entry => resolve(entry.toLocalURL()),
          err => reject(new Error(`解析相册路径失败：${JSON.stringify(err)}`)),
        )
      },
      err => reject(new Error(`相册选择失败：${err.message || JSON.stringify(err)}`)),
      {
        filter: 'image', // 仅选图片
        multiple: false, // 单选
        system: false, // 使用5+自定义相册（适配性更好）
      },
    )
  })
}

/**
 * 图片路径转Base64（带完整错误处理）
 * @param path 图片本地路径
 */
function imageToBase64(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      path,
      (entry) => {
        (entry as any).file(
          (file: any) => {
            const fileReader = new plus.io.FileReader()
            // 监听读取错误
            fileReader.onerror = err => reject(new Error(`读取图片失败：${JSON.stringify(err)}`))
            // 以Base64格式读取
            fileReader.readAsDataURL(file)
            fileReader.onloadend = (evt) => {
              const target = evt.target as any
              if (target?.result) {
                resolve(target.result as string)
              }
              else {
                reject(new Error('图片Base64转换失败：result为空'))
              }
            }
          },
          (err: any) => reject(new Error(`获取文件信息失败：${JSON.stringify(err)}`)),
        )
      },
      err => reject(new Error(`解析文件路径失败：${JSON.stringify(err)}`)),
    )
  })
}
