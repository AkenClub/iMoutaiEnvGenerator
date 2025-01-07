import { axiosRequest } from '@/api/http'

export function downloadByBlob(url: string, filename: string) {
  return new Promise((resolve, reject) => {
    getBlob(url)
      .then((res) => {
        console.log('下载成功', res)
        saveAs(res, filename)
        resolve(null)
      })
      .catch((err) => {
        console.error('下载失败：', err)
        reject(err)
      })
  })
}

function getBlob(url: string) {
  return axiosRequest.get(url, {
    responseType: 'blob',
  })
}

function saveAs(blob: any, filename: string) {
  const nav = window.navigator as any
  if (nav.msSaveOrOpenBlob) {
    console.log('支持 blob')
    nav.msSaveBlob(blob, filename)
  }
  else {
    console.warn('不支持 blob，走 a 标签')
    const link = document.createElement('a')
    const body = document.querySelector('body')!

    link.href = window.URL.createObjectURL(blob)
    link.download = filename

    link.style.display = 'none'
    body.append(link)

    link.click()
    link.remove()
    window.URL.revokeObjectURL(link.href)
  }
}
