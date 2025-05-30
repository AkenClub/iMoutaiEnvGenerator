export async function onRequest(context) {
  const { request, env, params } = context
  const VITE_APP_STORE_URL = env.VITE_APP_STORE_URL // 从 Cloudflare Pages 环境变量读取

  if (!VITE_APP_STORE_URL) {
    return new Response('Target URL not configured for appleapi proxy', { status: 500 })
  }

  // 获取原始请求路径中 [[path]] 匹配到的部分
  const subPathParts = params.path || []
  const subPath = subPathParts.join('/')

  // 构建目标 URL
  let queryString = ''
  const queryParamIndex = request.url.indexOf('?')
  if (queryParamIndex !== -1) {
    queryString = request.url.substring(queryParamIndex)
  }

  const targetUrl = `${VITE_APP_STORE_URL}/${subPath}${queryString}`

  // 复制原始请求的 Headers
  const headers = new Headers(request.headers)
  // Cloudflare 会自动处理 Host header，通常不需要手动设置
  // headers.set('Host', new URL(VITE_APP_STORE_URL).host);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    })

    // 直接返回从目标服务器获取的响应
    // 注意：直接传递 response.headers 可能会包含 Cloudflare 不允许客户端设置的头部 (e.g. cf-ray)
    // 最好是创建一个新的 Headers 对象，只复制必要的头部
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      // 过滤掉一些不应直接传递的头部，或者根据需要进行选择
      // 例如： 'content-encoding', 'transfer-encoding' 通常由 Cloudflare 处理
      if (!key.toLowerCase().startsWith('cf-') && key.toLowerCase() !== 'x-frame-options') {
        responseHeaders.append(key, value)
      }
    })

    // 确保内容类型正确
    if (response.headers.has('content-type')) {
      responseHeaders.set('content-type', response.headers.get('content-type'))
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  }
  catch (error) {
    console.error(`Proxy error for /appleapi/${subPath}:`, error)
    return new Response('Proxy error', { status: 502 }) // 502 Bad Gateway 更适合代理错误
  }
}
