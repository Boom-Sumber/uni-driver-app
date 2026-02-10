<script setup lang="ts">
import type { SelectorType } from '@/types/common'
import type { Employee } from '@/types/empl'
import type { ErrorNotice } from '@/types/error'
import type { OCRData } from '@/types/ocr'
import type { Trip } from '@/types/trip'
import type { ImageSourceType } from '@/utils/imageUtils'
import { onLoad, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { useRouter } from 'uni-mini-router'
import { computed, ref, watch } from 'vue'
import { dayjs, useMessage, useToast } from 'wot-design-uni'
import { getEmployees } from '@/apis/methods/employee'
import { addTrip, editTrip, searchTripsByDateRange, searchTripsByTrackingNumber, sortTrips } from '@/apis/methods/trip'
import { useIncrementalUpdate } from '@/composables/useIncrementalUpdate'
import { getImageOCR } from '@/utils/imageUtils'
import { getStorage, setStorage } from '@/utils/storage'

const router = useRouter()
const toast = useToast()
const messageBox = useMessage()
const ocrSlotMessage = useMessage('ocr-slot-message')

const mode = ref<'add' | 'edit'>('add')
const userInfo = getStorage('app_user')
// 定义完整的 Trip 默认值
const defaultTrip: Trip = {
  id: '',
  user_id: '',
  trip_date: dayjs().format('YYYY-MM-DD'),
  time_slot: '',
  tracking_number: '',
  highway_fee: 0,
  parking_fee: 0,
  other_fees: 0,
  empl_id: '',
  start_location: '',
  end_location: '',
  distance: 0,
  remarks: '',
  is_deleted: false,
  created_at: '',
  updated_at: '',
}
interface PageModel {
  distance: number | undefined
  highway_fee: number | undefined
  parking_fee: number | undefined
  other_fees: number | undefined
}
const trackingNumber = ref('')
const pageModel = ref<PageModel>({
  distance: undefined,
  highway_fee: undefined,
  parking_fee: undefined,
  other_fees: undefined,
})
// 表单数据 - 确保所有字段都有初始值
const initialData = ref<Partial<Trip>>({ ...defaultTrip })

const empl_list = ref<SelectorType[]>([])

const ocrResult = ref<OCRData | null>(null)

// 直接使用 useIncrementalUpdate 的返回值
let incrementalUpdate: ReturnType<typeof useIncrementalUpdate<Trip>>

// 用于获取method实例
let startDate = ''
let endDate = ''
let trips: Trip[] = []
let isUpdateCache: boolean = false

// 订单号输入框聚焦状态
const trackingOrderFocus = ref(false)

// 表单是否加载完成
let isLoaded = false

// 选择图片的弹窗状态
const showImagePicker = ref(false)

// ocr弹窗状态时页面保存按钮显示状态
const MsgVisibleWithBtnShow = ref(false)

// 时间选择器相关
const defaultDate = ref<number>(Date.now())
const showDatePicker = ref(false)
const showTimeSlotPicker = ref(false)
const defaultTimeSlot = ref([dayjs().subtract(1, 'hour').format('HH:mm'), dayjs().format('HH:mm')])

function handleStartAndEndTimeConfirm({ value: [start, end] }: { value: [string, string] }) {
  const timeSlot = `${start}-${end}`
  incrementalUpdate.formData.value.time_slot = timeSlot
  showTimeSlotPicker.value = false
}

// 跟单人员选择器相关
const showCoordinatorPicker = ref(false)
const selectedCoordinator = ref('')

// 计算属性：费用合计
const totalFee = computed(() => {
  const formData = incrementalUpdate?.formData.value
  if (!formData)
    return 0
  const highway = Number(formData.highway_fee) || 0
  const parking = Number(formData.parking_fee) || 0
  const other = Number(formData.other_fees) || 0
  return highway + parking + other
})

/**
 *  导航栏按钮点击事件
 * @todo: OCR识别功能---- 待完成
 */
onNavigationBarButtonTap(async (e) => {
  if (e.index === 0) {
    showImagePicker.value = true
  }
})

// 页面加载
onLoad(async (options) => {
  toast.loading('加载中...')
  uni.$on('cameraError', (isError) => {
    if (isError) {
      toast.close()
      MsgVisibleWithBtnShow.value = false
    }
  })
  isUpdateCache = JSON.parse(options?.isUpdateCache || 'false')
  const routeMode = options?.mode as 'add' | 'edit'
  if (routeMode) {
    startDate = options?.startDate || ''
    endDate = options?.endDate || ''
    mode.value = routeMode
  }

  // 页面加载模式判断
  if (mode.value === 'edit' && options?.trip) {
    uni.setNavigationBarTitle({
      title: '编辑行程',
    })
    try {
      const trip = JSON.parse(options.trip) as Trip
      initialData.value = { ...initialData.value, ...trip }
      defaultDate.value = new Date(trip.trip_date).getTime()
      selectedCoordinator.value = trip.empl_id
      trackingNumber.value = trip.tracking_number
      pageModel.value.distance = trip.distance
      pageModel.value.highway_fee = trip.highway_fee
      pageModel.value.parking_fee = trip.parking_fee
      pageModel.value.other_fees = trip.other_fees
      defaultTimeSlot.value = trip.time_slot.split('-')
    }
    catch (error) {
      toast.error('行程数据格式错误')
      console.error('解析行程数据错误:', error)
    }
  }
  else {
    uni.setNavigationBarTitle({
      title: '新增行程',
    })
    initialData.value.tracking_number = getDatePlaceholder()
    if (userInfo) {
      initialData.value.user_id = userInfo.id
    }
    else {
      toast.error('用户信息错误')
    }
  }

  // 初始化增量更新
  initializeIncrementalUpdate()
  handleStartAndEndTimeConfirm({ value: defaultTimeSlot.value as [string, string] })

  // 初始化员工列表  必须在初始化增量更新之后
  const employees: Employee[] = await getEmployees()
  empl_list.value = employees.map(item => ({
    value: item.id,
    label: item.name,
    disabled: false,
  }))
  // 初始化行程列表
  await onAddTripInitFrom()
  isLoaded = true
  toast.close()
})

watch(trackingOrderFocus, async (newValue) => {
  if (!newValue && isLoaded && trackingNumber.value && trackingNumber.value.length > 0) {
    incrementalUpdate.formData.value.tracking_number = trackingNumber.value
    try {
      const tripsWithTrackingNumber = await searchTripsByTrackingNumber(trackingNumber.value)
      if (tripsWithTrackingNumber.length > 0) {
        incrementalUpdate.formData.value.start_location = tripsWithTrackingNumber[0].start_location
        incrementalUpdate.formData.value.end_location = tripsWithTrackingNumber[0].end_location
        pageModel.value.distance = tripsWithTrackingNumber[0].distance
        pageModel.value.highway_fee = tripsWithTrackingNumber[0].highway_fee
      }
    }
    catch (error) {
      console.error('查询行程记录失败:', error)
      toast.error('查询行程记录失败')
    }
  }
})
watch(pageModel, (newValue) => {
  if (!newValue && !isLoaded) {
    return
  }
  if (newValue.distance !== undefined) {
    incrementalUpdate.formData.value.distance = newValue.distance
  }
  if (newValue.highway_fee !== undefined) {
    incrementalUpdate.formData.value.highway_fee = newValue.highway_fee
  }
  if (newValue.parking_fee !== undefined) {
    incrementalUpdate.formData.value.parking_fee = newValue.parking_fee
  }
  if (newValue.other_fees !== undefined) {
    incrementalUpdate.formData.value.other_fees = newValue.other_fees
  }
}, { deep: true })
// 新增行程初始化起点
async function onAddTripInitFrom() {
  if (!incrementalUpdate)
    return
  try {
    // 初始化数据
    trips = await searchTripsByDateRange(startDate, endDate)
  }
  catch (error) {
    toast.error('加载行程数据失败')
    throw error
  }
  if (mode.value === 'add') {
    const currentDataTrip = trips.filter(item => item.trip_date === dayjs(defaultDate.value).format('YYYY-MM-DD'))
    if (currentDataTrip.length > 0) {
      incrementalUpdate.formData.value.start_location = currentDataTrip[0].end_location
    }
    else {
      incrementalUpdate.formData.value.start_location = '工厂'
    }
  }
}

// 初始化增量更新
function initializeIncrementalUpdate() {
  try {
    // 确保 initialData 是完整的 Trip 对象
    const completeData = { ...defaultTrip, ...initialData.value } as Trip

    incrementalUpdate = useIncrementalUpdate(completeData, ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at', 'trip_expand'])
  }
  catch (error) {
    console.error('初始化增量更新失败:', error)
    toast.error('表单初始化失败')
  }
}

async function handleDateConfirm(event: any) {
  if (!incrementalUpdate)
    return

  if (dayjs().isBefore(event.value, 'day')) {
    defaultDate.value = Date.now()
    incrementalUpdate.formData.value.trip_date = dayjs().format('YYYY-MM-DD')
    return
  }
  incrementalUpdate.formData.value.trip_date = dayjs(event.value).format('YYYY-MM-DD')
  showDatePicker.value = false
  await onAddTripInitFrom()
}
// 订单号输入框占位符
function getDatePlaceholder(): string {
  const currentTimeNummber = Date.now() - dayjs().startOf('day').valueOf()
  return dayjs(dayjs(defaultDate.value).startOf('day').valueOf() + currentTimeNummber).format('YYYYMMDDHHmmss')
}

// 跟单人员选择器确认事件
function handleCoordinatorConfirm(event: any) {
  if (!incrementalUpdate)
    return

  const { value } = event
  // console.log('选择的跟单人员:', value)
  selectedCoordinator.value = value
  incrementalUpdate.formData.value.empl_id = value
  showCoordinatorPicker.value = false
}

// 检查对象是否为空  空对象返回true
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined)
    return true
  if (typeof value !== 'object')
    return false // 非对象类型（如字符串/数字）直接返回 false
  return Object.keys(value).length === 0
}

type CallbackFunc = (data: Trip | null) => Promise<void>
interface OperationConfig {
  cacheUpdater: (oldCache: Trip[], data: Trip | null) => Trip[]
  onSuccess: () => void | Promise<void>
}

// 通用错误处理函数
function handleCacheError(err: unknown, from: string): never {
  const errorMsg = err instanceof Error ? err.message : String(err)
  const errorNotice: ErrorNotice = {
    code: -1,
    customMsg: '更新缓存失败',
    msg: errorMsg,
    from,
  }
  throw new Error(JSON.stringify(errorNotice))
}

// 通用缓存更新函数
function updateCache(data: Trip | null, updater: (cache: Trip[], data: Trip | null) => Trip[]) {
  if (isUpdateCache) {
    const cacheExpire = dayjs().endOf('day').valueOf()
    if (!trips || !Array.isArray(trips) || trips.length === 0) {
      setStorage(`trip_${startDate}_${endDate}`, [data], cacheExpire)
    }
    else {
      const updatedCache = updater(trips, data)
      setStorage(`trip_${startDate}_${endDate}`, updatedCache, cacheExpire)
    }
  }
  // 刷新行程列表
  uni.$emit('refreshTripList', { startDate, endDate })
}

// 添加操作配置
const addTripConfig: OperationConfig = {
  cacheUpdater: (oldCache, data) => {
    if (data)
      oldCache.unshift(data)
    return sortTrips(oldCache)
  },
  onSuccess: async () => {
    MsgVisibleWithBtnShow.value = true
    await messageBox.confirm({
      msg: '添加成功，是否继续添加？',
      title: '新增行程',
      confirmButtonText: '继续',
      cancelButtonText: '返回',
    })
      .then(async () => {
        incrementalUpdate.formData.value = {
          ...defaultTrip,
          user_id: userInfo?.id || '',
          trip_date: dayjs().format('YYYY-MM-DD'),
          tracking_number: getDatePlaceholder(),
        }
        defaultTimeSlot.value = [dayjs().subtract(1, 'hour').format('HH:mm'), dayjs().format('HH:mm')]
        pageModel.value = {
          distance: undefined,
          highway_fee: undefined,
          parking_fee: undefined,
          other_fees: undefined,
        }
        selectedCoordinator.value = ''
        showCoordinatorPicker.value = false
        showTimeSlotPicker.value = false
        await onAddTripInitFrom()
      })
      .catch(() => {
        const a = getCurrentPages()
        router.back({ animationType: 'slide-out-right', delta: a.length - 1 })
      })
    toast.close()
  },
}

// 编辑操作配置
const editTripConfig: OperationConfig = {
  cacheUpdater: (oldCache, data) => {
    const index = oldCache.findIndex(item => item.id === data?.id)
    if (index !== -1 && data) {
      oldCache[index] = data
    }
    return oldCache
  },
  onSuccess: () => {
    toast.success({
      msg: '更新完成，即将返回上一页',
      duration: 2000,
    })
    setTimeout(() => {
      const a = getCurrentPages()
      router.back({ animationType: 'slide-out-right', delta: a.length - 1 })
    }, 2000)
  },
}

// 通用的缓存处理器
function createCacheHandler(config: OperationConfig): CallbackFunc {
  return async (data) => {
    try {
      updateCache(data, config.cacheUpdater)
      MsgVisibleWithBtnShow.value = true
      toast.close()
      await config.onSuccess()
    }
    catch (err) {
      handleCacheError(err, 'saveTrip')
    }
  }
}

const handleAdd = createCacheHandler(addTripConfig)
const handleEdit = createCacheHandler(editTripConfig)

const operationMap = new Map<string, CallbackFunc>()
operationMap.set('addTrip', handleAdd)
operationMap.set('editTrip', handleEdit)

// 保存行程
async function saveTrip() {
  if (!validateForm())
    return

  toast.loading({
    loadingType: 'ring',
    msg: '正在保存...',
    direction: 'vertical',
  })

  setTimeout(async () => {
    let result: Trip | null = null
    const operationKey = mode.value === 'add' ? 'addTrip' : 'editTrip'

    if (mode.value === 'add') {
      const { id, created_at, updated_at, is_deleted, deleted_at, trip_expand, ...insertData } = incrementalUpdate?.formData.value
      try {
        result = await addTrip(insertData)
      }
      catch (error) {
        toast.error('新增行程失败')
        throw error
      }
    }
    else if (mode.value === 'edit') {
      if (isEmpty(incrementalUpdate?.diffData.value)) {
        toast.error({ msg: '未检测到需要更新的内容', duration: 2000 })
        return
      }
      try {
        result = await editTrip(incrementalUpdate?.diffData.value, incrementalUpdate?.formData.value.id)
      }
      catch (error) {
        toast.error('编辑行程失败')
        throw error
      }
    }
    const operation = operationMap.get(operationKey)
    if (operation) {
      await operation(result)
    }
  }, 1000)
}

// 表单验证
function validateForm(): boolean {
  if (!incrementalUpdate)
    return false

  const formData = incrementalUpdate.formData.value
  if (!formData.tracking_number) {
    toast.error('请输入订单号')
    return false
  }

  if (!formData.trip_date) {
    toast.error('请选择行程日期')
    return false
  }

  if (!formData.start_location) {
    toast.error('请输入起始地点')
    return false
  }

  if (!formData.end_location) {
    toast.error('请输入结束地点')
    return false
  }
  if (!formData.distance || Number(formData.distance) <= 0) {
    toast.error('请输入有效里程')
    return false
  }
  return true
}
async function handleImageConfirm(value: string) {
  showImagePicker.value = false
  // 非相机/相册选项，直接返回
  if (!['相机', '相册'].includes(value)) {
    return
  }
  // 映射中文选项到 OCR 接口需要的参数
  const sourceMap: Record<string, ImageSourceType> = {
    相机: 'camera',
    相册: 'gallery',
  }
  const ocrSource = sourceMap[value]
  toast.loading({
    loadingType: 'ring',
    msg: '正在识别图片...',
    direction: 'vertical',
  })
  try {
    ocrResult.value = await getImageOCR(ocrSource)
  }
  catch (error) {
    toast.error('识别图片失败')
    throw error
  }

  toast.close()
  if (ocrResult.value) {
    MsgVisibleWithBtnShow.value = true
    ocrSlotMessage.confirm({
      title: '确认识别结果',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    }).then(() => {
      trackingNumber.value = ocrResult.value?.order || ''
      incrementalUpdate.formData.value.end_location = ocrResult.value?.address || ''
    }).finally(() => {
      MsgVisibleWithBtnShow.value = false
    })
  }
  else {
    toast.error('识别失败')
  }
}
</script>

<template>
  <wd-message-box />
  <wd-message-box selector="ocr-slot-message">
    <view class="ocr-result-container">
      <wd-grid :column="2" clickable>
        <wd-grid-item>
          <text class="grid-item-label">
            送货订单 :
          </text>
        </wd-grid-item>
        <wd-grid-item>
          <text class="grid-item-content">
            {{ ocrResult?.order || '未识别到订单号' }}
          </text>
        </wd-grid-item>
        <wd-grid-item>
          <text class="grid-item-label">
            配送地址 :
          </text>
        </wd-grid-item>
        <wd-grid-item>
          <text class="grid-item-content">
            {{ ocrResult?.address || '未识别到配送地址' }}
          </text>
        </wd-grid-item>
      </wd-grid>
    </view>
  </wd-message-box>
  <wd-toast />
  <custom-picker-popup
    v-model="showImagePicker"
    :columns="['相机', '相册']"
    @confirm="handleImageConfirm"
  />
  <view class="page-container">
    <view v-if="incrementalUpdate" class="page-content">
      <!-- 基本信息卡片 -->
      <wd-card title="基本信息" custom-class="form-card">
        <wd-cell-group border>
          <!-- 订单号 -->
          <wd-input
            v-model="trackingNumber"
            label="送货订单"
            :placeholder="getDatePlaceholder()"
            clearable
            clear-trigger="focus"
            custom-class="required-field"
            @focus="() => trackingOrderFocus = true"
            @blur="() => trackingOrderFocus = false"
          />

          <wd-datetime-picker
            v-model="defaultDate"
            v-model:visible="showDatePicker"
            label="行程日期"
            :min-date="dayjs(startDate).valueOf()"
            :max-date="dayjs(endDate).valueOf()"
            align-right
            marker-side="after"
            custom-class="required-field"
            type="date"
            @confirm="handleDateConfirm"
          />

          <wd-datetime-picker
            v-model="defaultTimeSlot"
            v-model:visible="showTimeSlotPicker"
            label="时间选择"
            type="time"
            align-right
            @confirm="handleStartAndEndTimeConfirm"
          />

          <!-- 跟单人员 -->
          <wd-picker
            v-model="selectedCoordinator"
            v-model:visible="showCoordinatorPicker"
            label="跟单人员"
            align-right
            marker-side="after"
            placeholder="请选择"
            custom-class="required-field"
            :columns="empl_list"
            @confirm="handleCoordinatorConfirm"
          />
        </wd-cell-group>
      </wd-card>

      <!-- 行程信息卡片 -->
      <wd-card title="行程信息" custom-class="form-card">
        <wd-cell-group border>
          <!-- 起始地点 -->
          <wd-input
            v-model="incrementalUpdate.formData.value.start_location"
            label="起始地点"
            placeholder="请输入起始地点"
            clearable
            clear-trigger="focus"
            custom-class="required-field"
            :confirm-hold="false"
          />

          <!-- 结束地点 -->
          <wd-input
            v-model="incrementalUpdate.formData.value.end_location"
            label="结束地点"
            placeholder="请输入结束地点"
            clearable
            clear-trigger="focus"
            custom-class="required-field"
            :confirm-hold="false"
          />

          <!-- 里程 -->
          <wd-input
            v-model="pageModel.distance"
            label="里程(公里)"
            type="number"
            placeholder="0"
            :cursor-spacing="20"
            clearable
            inputmode="numeric"
            @clear="() => incrementalUpdate.formData.value.distance = 0"
            @input="(e) => incrementalUpdate.formData.value.distance = e.value"
          />
        </wd-cell-group>
      </wd-card>

      <!-- 费用信息卡片 -->
      <wd-card title="费用信息" custom-class="form-card">
        <wd-cell-group border>
          <!-- 高速费 -->
          <wd-input
            v-model="pageModel.highway_fee"
            label="高速费(元)"
            type="number"
            placeholder="0"
            :cursor-spacing="20"
            inputmode="numeric"
            clearable
            @clear="() => incrementalUpdate.formData.value.highway_fee = 0"
            @input="(e) => incrementalUpdate.formData.value.highway_fee = e.value"
          />

          <!-- 停车费 -->
          <wd-input
            v-model="pageModel.parking_fee"
            label="停车费(元)"
            type="number"
            placeholder="0"
            :cursor-spacing="20"
            inputmode="numeric"
            clearable
            @clear="() => incrementalUpdate.formData.value.parking_fee = 0"
            @input="(e) => incrementalUpdate.formData.value.parking_fee = e.value"
          />

          <!-- 其他费用 -->
          <wd-input
            v-model="pageModel.other_fees"
            label="其他费用(元)"
            type="number"
            placeholder="0"
            :cursor-spacing="20"
            inputmode="numeric"
            clearable
            @clear="() => incrementalUpdate.formData.value.other_fees = 0"
            @input="(e) => incrementalUpdate.formData.value.other_fees = e.value"
          />

          <!-- 费用合计 -->
          <wd-cell title="费用合计(元)" :value="totalFee.toFixed(2)" />
        </wd-cell-group>
      </wd-card>

      <!-- 备注信息卡片 -->
      <wd-card title="备注信息" custom-class="form-card">
        <view class="textarea-container">
          <wd-textarea
            v-model="incrementalUpdate.formData.value.remarks"
            placeholder="请输入备注信息"
            :autosize="{ minRows: 3 }"
            clear-trigger="focus"
          />
        </view>
      </wd-card>

      <!-- 保存按钮 -->
      <view class="save-button-container" :class="{ 'picker-open': MsgVisibleWithBtnShow }">
        <wd-button
          type="primary"
          size="large"
          block
          custom-class="save-button"
          @click="saveTrip"
        >
          保存行程
        </wd-button>
      </view>
    </view>
    <view v-else class="loading-container">
      加载中...
    </view>
  </view>
</template>

<style scoped lang="scss">
.ocr-result-container {
  padding: 20rpx;
}

.grid-item-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.grid-item-content {
  font-size: 28rpx;
  color: #666;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
}

.popup-button {
  padding: 12rpx 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 16rpx;
  transition: background-color 0.3s ease;
}

.cancel-button {
  color: #333;
  background-color: #f5f5f5;
  margin-left: auto;
}

.confirm-button {
  color: #fff;
  background-color: var(--theme-color);
  margin-right: auto;
}

.page-container {
  min-height: 100vh;
  background-color: var(--primary-bg-color);
}

.page-content {
  padding: 20rpx;
  padding-bottom: 120rpx; // 为底部按钮留出空间
}

:deep(.form-card) {
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx var(--wot-color-border);
}

// 必填字段样式 - 修正红星位置
:deep(.required-field) {
  .wd-input__label,
  .wd-cell__title {
    position: relative;
    display: flex;
    align-items: center;

    &::after {
      content: '*';
      color: #fa5151;
      margin-left: 8rpx;
      line-height: 1;
      // 使用 transform 微调垂直位置
      transform: translateY(7rpx);
    }
  }
}

// 文本域容器
.textarea-container {
  padding: 20rpx;
}

// 保存按钮容器 - 添加选择器打开时的隐藏逻辑
.save-button-container {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 1000;
  transition: opacity 0.3s ease;

  // 当选择器打开时隐藏按钮
  &.picker-open {
    opacity: 0;
    pointer-events: none;
  }
}

.form-row {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  min-height: 100rpx;
  box-sizing: border-box;
}

.save-button {
  border-radius: 16rpx !important;
  height: 88rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
}

// 输入框样式调整
:deep(.wd-input) {
  text-align: right;
}

// 费用合计样式
:deep(.wd-cell__value) {
  color: var(--wd-primary-color);
  font-weight: 600;
}

// 确保选择器有足够的 z-index
:deep(.wd-popup) {
  z-index: 1001 !important;
}
</style>
