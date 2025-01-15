import type { ExpandAxiosResponse, InterceptorHooks } from '@/utils/axios/types'
import { axiosRequest } from '@/api/http/index'
import { useUserStoreHook } from '@/stores/modules/user'
import NProgress from '@/utils/progress'

// 与后端约定的请求成功码
const SUCCESS_CODE = 2000

export function customInterceptorHooks(): InterceptorHooks {
  return {
    requestInterceptor(config) {
      console.log('请求拦截：', config.data?.type, config)

      // 开启进度条动画
      NProgress.start()
      return config
    },
    requestInterceptorCatch(err) {
      console.log('请求拦截 异常：', err)
      // 请求错误，这里可以用全局提示框进行提示
      return Promise.reject(err)
    },

    responseInterceptor(response) {
      // 关闭进度条动画
      NProgress.done()

      // 因为 axios 返回不支持扩展自定义配置，需要自己断言一下
      const res = response as ExpandAxiosResponse
      console.log('响应拦截：', res.config.data, res)

      if (res.config.requestOptions?.skipResponseInterceptor) {
        return res.data
      }

      if (res.data.code && res.data.code === 403) {
        if (!axiosRequest.isRefreshingToken) {
          axiosRequest.isRefreshingToken = true
          useUserStoreHook()
            .refreshCookie()
            .then(() => {
              console.log('刷新 cookie')
              // 执行缓存的请求
              axiosRequest.executeCachedRequests()
            })
            .finally(() => {
              axiosRequest.isRefreshingToken = false
            })
        }
        // 将原来请求保存，等待刷新 cookie 后回调重新发起请求再返回结果
        return axiosRequest.retryOriginalRequest(response.config)
      }

      if (res.status !== 200)
        return Promise.reject(res)

      // 在下载文件时，code 不存在，但是应该直接放行，让其完成下载
      if (res.data.code && res.data.code !== SUCCESS_CODE) {
        // 所以这里只判断存在 code 且不对应设置的成功码 的时候
        if (res.config.requestOptions?.globalErrorMessage) {
          // 这里全局提示错误
          console.error('后台返回的状态码 非200：', res.data.code, res.data.message)
          res.config.requestOptions?.globalErrorMessageHandle && res.config.requestOptions?.globalErrorMessageHandle(res.data.message || '未知错误')
        }
        return Promise.reject(res.data)
      }
      if (res.config.requestOptions?.globalSuccessMessage) {
        // 这里全局提示请求成功
        console.log('全局提示请求成功', res.data)
      }
      // 请求返回值，建议将 返回值 进行解构
      return res.data
    },
    responseInterceptorCatch(err) {
      console.log('响应拦截 异常：', err)

      // 关闭进度条动画
      NProgress.done()

      // 这里用来处理 http 常见错误，进行全局提示
      const mapErrorStatus = new Map([
        [400, '请求方式错误'],
        [401, '请重新登录'],
        [403, '拒绝访问'],
        [404, '请求地址有误'],
        [500, '服务器出错'],
      ])
      const message = (err.response && mapErrorStatus.get(err.response.status)) || err.response?.data?.message || '请求出错，请稍后再试'
      if (err.config.requestOptions?.globalErrorMessage) {
        // 这里全局提示错误
        console.error('响应异常：', message)
        err.config.requestOptions?.globalErrorMessageHandle
        && err.config.requestOptions?.globalErrorMessageHandle(message)
      }
      return Promise.reject(err.response.data)
    },
  }
}
