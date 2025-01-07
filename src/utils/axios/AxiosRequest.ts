import type { ExpandAxiosRequestConfig, InterceptorHooks } from './types'
import axios, { type AxiosInstance, type AxiosResponse, type CustomParamsSerializer } from 'axios'
import { stringify } from 'qs'

/**
 * 📢 一般不用动此文件，使用时直接 new Request 即可
 */

// 导出Request类，可以用来自定义传递配置来创建实例
export default class AxiosRequest {
  // axios 实例
  private _instance: AxiosInstance

  // 默认配置
  private _defaultConfig: ExpandAxiosRequestConfig = {
    // 默认请求超时时间
    timeout: 10000,
    // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
    paramsSerializer: {
      serialize: stringify as unknown as CustomParamsSerializer,
    },
  }

  private _interceptorHooks?: InterceptorHooks

  constructor(config: ExpandAxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this._instance = axios.create(Object.assign(this._defaultConfig, config))
    this._interceptorHooks = config.interceptorHooks
    this.setupInterceptors()
  }

  // 通用拦截，在初始化时就进行注册和运行，对基础属性进行处理
  private setupInterceptors() {
    this._instance.interceptors.request.use(
      this._interceptorHooks?.requestInterceptor,
      this._interceptorHooks?.requestInterceptorCatch,
    )
    this._instance.interceptors.response.use(
      this._interceptorHooks?.responseInterceptor,
      this._interceptorHooks?.responseInterceptorCatch,
    )
  }

  // 定义核心请求
  public request(config: ExpandAxiosRequestConfig): Promise<AxiosResponse> {
    // ！！！⚠️ 注意：axios 已经将请求使用 promise 封装过了
    // 这里直接返回，不需要我们再使用 promise 封装一层
    return this._instance.request(config)
  }

  public get<T = any>(url: string, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.get(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.delete(url, config)
  }
}
