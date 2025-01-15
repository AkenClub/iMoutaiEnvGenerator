// 定义一个常见后端请求返回
import { customInterceptorHooks } from '@/api/http/customInterceptorHooks'
import { AxiosRequestExt } from '@/utils/axios/AxiosRequestExt'
import { ElMessage } from 'element-plus'

// 具体使用时先实例一个请求对象
export const axiosRequest = new AxiosRequestExt({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  requestOptions: {
    globalSuccessMessage: false,
    globalErrorMessage: true,
    globalErrorMessageHandle: (errorMessage?: string) => {
      ElMessage.error({
        message: errorMessage || '未知错误',
      })
    },
  },
  interceptorHooks: customInterceptorHooks(),
})
