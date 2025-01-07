import type { ExpandInternalAxiosRequestConfig } from '@/utils/axios/types'
import AxiosRequest from '@/utils/axios/AxiosRequest'

/**
 * 对基本的 AxiosRequest 做拓展，补充 请求重连机制
 */
export class AxiosRequestExt extends AxiosRequest {
  /** token过期后，暂存待执行的请求 */
  public requestsCache: Array<() => Promise<void>> = []

  /** 防止重复刷新token */
  public isRefreshingToken = false

  /** 重连原始请求，一般用于 Token / Cookie 失效后，原请求失败需要在授权后重新发起请求 */
  public retryOriginalRequest(config: ExpandInternalAxiosRequestConfig) {
    return new Promise((resolve) => {
      this.requestsCache.push(async () => {
        // 等待 token 被刷新后回调，用原请求的配置重新发起请求
        resolve(this.request(config))
      })
    })
  }

  /**
   * 刷新 Token 成功后，执行缓存的请求队列
   */
  public executeCachedRequests(): void {
    const cachedRequests = [...this.requestsCache]
    this.requestsCache = [] // 清空缓存
    cachedRequests.forEach(request => request())
  }
}
