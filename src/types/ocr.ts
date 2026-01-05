/**
 *  ocr 响应类型
 */
export interface OCR {
  data: OCRData
  error: OCRError
}

export interface OCRError {
  code: number
  message: any
}

export interface OCRData {
  /** 货运单号 */
  order: string
  /** 配送地址 */
  address: string
}
