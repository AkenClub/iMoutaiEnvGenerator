export {}

/**
 * 📢 一般不用动此文件
 * 示例，按照项目实际情况编写
 */
/*
import Request from './Request'
import { templateInterceptorHooks } from './templateInterceptorHooks'

// 定义一个常见后端请求返回
export type BaseApiResponse<T> = {
  code: number
  message: string
  result: T
}

// 具体使用时先实例一个请求对象
const request = new Request({
  // baseURL: '/api',
  requestOptions: {
    globalErrorMessage: true,
    globalSuccessMessage: false
  },
  interceptorHooks: templateInterceptorHooks
})

export default request
*/

/*
// 用法
interface ResModel {
  str: string
  num: number
}
// 发起请求
request
  .post<ResModel>(
    '/abc',
    {
      a: 'aa',
    },
    {
      requestOptions: {
        globalErrorMessage: true,
      },
    }
  )
  .then((res) => {
    console.log('res: ', res)
    console.log(res.str)
  })
*/
