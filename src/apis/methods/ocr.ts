import type { ErrorNotice } from '@/types/error'
import type { OCR, OCRData, OCRError } from '@/types/ocr'

/**
 * 获取ocr结果
 * @param {string} imageBase64  图片base64
 * @return promise<OCR>
 */
function ResquestOCR(imageBase64: string): Promise<OCR> {
  return new Promise((resolve, reject) => {
    uni.request({
      timeout: 15000,
      url: 'https://ruxsmile.dpdns.org/api/ocr',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      data: {
        ImageBase64: imageBase64,
      },
      success: (res) => {
        const result = res.data as OCR
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(result)
        }
        else {
          reject(new Error(JSON.stringify(result.error as OCRError)))
        }
      },
      fail: (err) => {
        const e: OCRError = {
          code: 408,
          message: err.errMsg,
        }
        reject(new Error(JSON.stringify(e)))
      },
    })
  })
}

/**
 * 获取ocr结果
 * @param {string} imageBase64  图片base64
 * @return promise<OCRData>
 */
export async function getOCR(imageBase64: string) {
  try {
    const { data } = await ResquestOCR(imageBase64)
    if (data.order === '' && data.address === '') {
      return null
    }
    return data
  }
  catch (err) {
    const errMsg = JSON.parse((err as Error).message) as OCRError

    const _customMsg = errMsg.code !== 408 ? errMsg.message : '网络异常,请重试'
    const errorNotice: ErrorNotice = {
      code: errMsg.code,
      msg: errMsg,
      customMsg: _customMsg,
      from: 'OCR',
    }
    throw new Error(JSON.stringify(errorNotice))
  }
}
