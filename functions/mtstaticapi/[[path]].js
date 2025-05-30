export async function onRequest(context) {
  const { request, env, params } = context
  const VITE_MT_SHOP_STATIC_URL = env.VITE_MT_SHOP_STATIC_URL // 从 Cloudflare Pages 环境变量读取

  if (!VITE_MT_SHOP_STATIC_URL) {
    return new Response('Target URL not configured for mtstaticapi proxy', { status: 500 })
  }

  const subPathParts = params.path || []
  const subPath = subPathParts.join('/')

  let queryString = ''
  const queryParamIndex = request.url.indexOf('?')
  if (queryParamIndex !== -1) {
    queryString = request.url.substring(queryParamIndex)
  }

  const targetUrl = `${VITE_MT_SHOP_STATIC_URL}/${subPath}${queryString}`

  const headers = new Headers(request.headers)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    })

    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('cf-') && key.toLowerCase() !== 'x-frame-options') {
        responseHeaders.append(key, value)
      }
    })

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
    console.error(`Proxy error for /mtstaticapi/${subPath}:`, error)
    return new Response('Proxy error', { status: 502 })
  }
}
