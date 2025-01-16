import process from 'node:process'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()

// 添加静态文件服务
app.use(express.static('dist'))

// 环境变量
const env = {
  VITE_APP_STORE_API_PREFIX: '/appleapi',
  VITE_APP_STORE_URL: 'https://apps.apple.com',
  VITE_MT_SHOP_STATIC_API_PREFIX: '/mtstaticapi',
  VITE_MT_SHOP_STATIC_URL: 'https://static.moutai519.com.cn',
  VITE_MT_APP_API_PREFIX: '/mtappapi',
  VITE_MT_APP_API_URL: 'https://app.moutai519.com.cn',
}

// 配置代理
app.use(
  env.VITE_APP_STORE_API_PREFIX,
  createProxyMiddleware({
    target: env.VITE_APP_STORE_URL,
    changeOrigin: true,
    pathRewrite: path =>
      path.replace(new RegExp(`^${env.VITE_APP_STORE_API_PREFIX}`), ''),
  }),
)

app.use(
  env.VITE_MT_SHOP_STATIC_API_PREFIX,
  createProxyMiddleware({
    target: env.VITE_MT_SHOP_STATIC_URL,
    changeOrigin: true,
    pathRewrite: path =>
      path.replace(new RegExp(`^${env.VITE_MT_SHOP_STATIC_API_PREFIX}`), ''),
  }),
)

app.use(
  env.VITE_MT_APP_API_PREFIX,
  createProxyMiddleware({
    target: env.VITE_MT_APP_API_URL,
    changeOrigin: true,
    headers: {
      // 浏览器控制台中出现 Refused to set unsafe header "User-Agent" 报错是浏览器的安全策略导致，
      // 前端 axios 虽然设置了 UA，但是基于这个安全策略的原因，浏览器会自动修改 UA 为浏览器的 UA。
      // 所以需要在这里重新设置 UA，避免在茅台 APP 接口中出现浏览器的 UA。
      'User-Agent': 'iOS;16.3;Apple;?unrecognized?',
    },
    pathRewrite: path =>
      path.replace(new RegExp(`^${env.VITE_MT_APP_API_PREFIX}`), ''),
  }),
)

// 启动服务器
const PORT = process.env.PORT || 12999
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
