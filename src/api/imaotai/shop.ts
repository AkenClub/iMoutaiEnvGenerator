import { axiosRequest } from '@/api/http'

// 商品信息接口类型定义
interface ProductInfo {
  itemCode: string
  title: string
}

interface ProductResponse {
  code: number
  data: {
    sessionId: string
    itemList: Array<{
      itemCode: string
      title: string
      pictureV2?: string
    }>
  }
}

// 商店信息接口类型定义
interface ShopInfo {
  lat: string
  lng: string
  name: string
  shopId: string
  fullAddress: string
  cityName: string
  provinceName: string
}

interface ShopResourceResponse {
  code: number
  data: {
    myserviceshops: {
      url: string
    }
  }
}

interface ShopsData {
  [key: string]: ShopInfo
}

const MT_SHOP_STATIC_API_PREFIX = import.meta.env.VITE_MT_SHOP_STATIC_API_PREFIX

/**
 * 获取可预约的商品信息
 */
export async function getProductInfo() {
  try {
    const timestamp = String(Math.floor(new Date().setHours(0, 0, 0, 0)))
    const response = await axiosRequest.get<ProductResponse>(
      `${MT_SHOP_STATIC_API_PREFIX}/mt-backend/xhr/front/mall/index/session/get/${timestamp}`,
    )

    if (response.code !== 2000) {
      throw new Error('获取商品信息失败')
    }

    const { sessionId, itemList } = response.data
    const formattedItemList = itemList.map(item => ({
      itemCode: item.itemCode,
      title: item.title || `未知商品，可结合该商品图片链接来判断：${item.pictureV2 || '无图片信息'}`,
    }))

    return {
      sessionId,
      itemList: formattedItemList,
    }
  }
  catch (error: any) {
    throw new Error(`获取商品信息失败：${error?.message || '未知错误'}`)
  }
}

/**
 * 获取售卖商店信息
 */
export async function getShopInfo(provinceName: string, cityName: string): Promise<ShopInfo[]> {
  try {
    const resourceResponse = await axiosRequest.get<ShopResourceResponse>(
      `${MT_SHOP_STATIC_API_PREFIX}/mt-backend/xhr/front/mall/resource/get`,
    )

    if (resourceResponse.code !== 2000) {
      throw new Error('获取资源信息失败 ')
    }

    const myserviceshopsUrl = resourceResponse.data.myserviceshops.url
    const shopsResponse = await axiosRequest.get<ShopsData>(myserviceshopsUrl)

    const result: ShopInfo[] = []
    Object.values(shopsResponse).forEach((shop) => {
      if (shop.provinceName === provinceName && shop.cityName === cityName) {
        result.push({
          lat: shop.lat,
          lng: shop.lng,
          name: shop.name,
          shopId: shop.shopId,
          fullAddress: shop.fullAddress,
          cityName: shop.cityName,
          provinceName: shop.provinceName,
        })
      }
    })

    return result
  }
  catch (error: any) {
    throw new Error(`获取商店信息失败：${error?.message || '未知错误'}`)
  }
}

export type { ProductInfo, ShopInfo }
