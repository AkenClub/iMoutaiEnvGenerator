import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * 📢 一般不用动此文件
 */

// 拓展 axios 请求配置，加入我们自己的配置
interface RequestOptions {
  // 是否全局展示请求 错误信息
  globalErrorMessage?: boolean
  // 全局展示请求的 错误信息 的处理方法
  globalErrorMessageHandle?: (errorMessage?: string) => void
  // 是否全局展示请求 成功信息
  globalSuccessMessage?: boolean
  // 是否全局展示请求 成功信息 的处理方法
  globalSuccessMessageHandle?: (successMessage?: string) => void
  // 是否跳过响应拦截器
  skipResponseInterceptor?: boolean
}

// 定义拦截器
export interface InterceptorHooks {
  requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestInterceptorCatch?: (error: any) => any
  responseInterceptor?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  responseInterceptorCatch?: (error: any) => any
}

// 拓展自定义请求配置
export interface ExpandAxiosRequestConfig<T = any> extends AxiosRequestConfig<T> {
  interceptorHooks?: InterceptorHooks
  requestOptions?: RequestOptions
}

// 拓展 axios 请求配置
export interface ExpandInternalAxiosRequestConfig<T = any> extends InternalAxiosRequestConfig<T> {
  interceptorHooks?: InterceptorHooks
  requestOptions?: RequestOptions
}

// 拓展 axios 返回配置
export interface ExpandAxiosResponse<T = any, D = any> extends AxiosResponse<T, D> {
  config: ExpandInternalAxiosRequestConfig<D>
}
