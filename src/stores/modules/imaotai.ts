import { defineStore } from 'pinia'
import { reactive } from 'vue'

// 配置环境变量：KEN_IMAOTAI_ENV
// 直接使用 `#` 作为分隔符即可
// 内容格式为：PHONE_NUMBER#USER_ID#DEVICE_ID#MT_VERSION#PRODUCT_ID_LIST#SHOP_ID^SHOP_MODE^PROVINCE^CITY#LAT#LNG#TOKEN#COOKIE
// 解释：手机号码#用户ID#设备ID#版本号#商品ID列表#店铺ID店铺缺货时自动采用的模式^省份^城市#纬度#经度#TOKEN#COOKIE
// 多个用户时使用 & 连接。

export interface ImaotaiState {
  phoneNumber: string
  userId: string
  deviceId: string
  mtVersion: string
  productIdList: string
  shopId: string
  shopMode: string
  province: string
  city: string
  lat: string
  lng: string
  token: string
  cookie: string
}

export const useImaotaiStore = defineStore('imaotai', () => {
  const state = reactive<ImaotaiState>({
    phoneNumber: '',
    userId: '',
    deviceId: '',
    mtVersion: '',
    productIdList: '',
    shopId: '',
    shopMode: '',
    province: '',
    city: '',
    lat: '',
    lng: '',
    token: '',
    cookie: '',
  })

  // 生成环境变量字符串，使用#作为分隔符
  function generateEnvString() {
    return [
      state.phoneNumber,
      state.userId,
      state.deviceId,
      state.mtVersion,
      state.productIdList,
      `${state.shopId}^${state.shopMode}^${state.province}^${state.city}`,
      state.lat,
      state.lng,
      state.token,
      state.cookie,
    ].join('#')
  }

  return {
    state,
    generateEnvString,
  }
})
