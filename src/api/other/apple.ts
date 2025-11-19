import { axiosRequest } from '@/api/http'

const APPLE_API_PRE_FIX = import.meta.env.VITE_APP_STORE_API_PREFIX

/**
 * 从苹果应用商店获取茅台应用的版本号
 * @returns Promise<string> 返回版本号
 * @throws Error 当无法获取版本号时抛出异常
 */
export async function getMtAppVersion(): Promise<string> {
  try {
    const response = await axiosRequest.get<string>(`${APPLE_API_PRE_FIX}/cn/app/i%E8%8C%85%E5%8F%B0/id1600482450`)

    // 使用正则表达式匹配版本号，优先匹配原有格式
    let pattern = /new__latest__version">(.*?)<\/p>/
    let match = response.match(pattern)

    // 兼容：如果原有格式未匹配到，尝试匹配新格式 <h4 class="svelte-13339ih">版本 1.8.5</h4>
    if (!match) {
      pattern = /<h4[^>]*>版本\s+(\d+\.\d+\.\d+)<\/h4>/
      match = response.match(pattern)
    }

    if (match && match[1]) {
      // 清理版本号字符串，去除"版本 "前缀和空白字符
      const mtVersion = match[1].trim().replace('版本 ', '')
      return mtVersion
    }
    throw new Error('获取版本号失败：未找到版本信息')
  }
  catch (error: any) {
    throw new Error(`获取版本号失败：${error?.message || '未知错误'}`)
  }
}
