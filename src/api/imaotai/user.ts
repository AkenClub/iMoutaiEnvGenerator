import { axiosRequest } from '@/api/http'
import md5 from 'md5'

interface SendCodeResponse {
  code: number
  message?: string
}

interface LoginResponse {
  code: number
  message?: string
  data: {
    userId: string
    token: string
    cookie: string
    [key: string]: any
  }
}

const MT_APP_API_PREFIX = import.meta.env.VITE_MT_APP_API_PREFIX

/**
 * 发送验证码
 */
export async function sendVerifyCode(mobile: string, deviceId: string, mtVersion: string): Promise<void> {
  const timestamp = Date.now()
  const data = {
    mobile,
    md5: generateSignature(mobile, timestamp),
    timestamp: String(timestamp),
  }

  const headers = {
    'MT-Device-ID': deviceId,
    'MT-APP-Version': mtVersion,
    'User-Agent': 'iOS;16.3;Apple;?unrecognized?',
    'Content-Type': 'application/json',
  }

  const response = await axiosRequest.post<SendCodeResponse>(
    `${MT_APP_API_PREFIX}/xhr/front/user/register/vcode`,
    data,
    { headers },
  )

  if (response.code !== 2000) {
    throw new Error(response.message || '发送验证码失败')
  }
}

/**
 * 登录
 */
export async function login(params: {
  mobile: string
  vCode: string
  deviceId: string
  mtVersion: string
}): Promise<LoginResponse['data']> {
  const timestamp = Date.now()
  const data = {
    'mobile': params.mobile,
    'vCode': params.vCode,
    'md5': generateSignature(params.mobile + params.vCode, timestamp),
    'timestamp': String(timestamp),
    'MT-APP-Version': params.mtVersion,
  }

  const headers = {
    'MT-Device-ID': params.deviceId,
    'MT-APP-Version': params.mtVersion,
    'User-Agent': 'iOS;16.3;Apple;?unrecognized?',
    'Content-Type': 'application/json',
  }

  const response = await axiosRequest.post<LoginResponse>(
    `${MT_APP_API_PREFIX}/xhr/front/user/register/login`,
    data,
    { headers, requestOptions: { globalErrorMessage: false } },
  )

  if (!response || response.code !== 2000 || !response.data) {
    throw new Error(response.message || '登录失败')
  }

  return response.data
}

// 生成签名
function generateSignature(content: string, timestamp: number): string {
  const SALT = '2af72f100c356273d46284f6fd1dfc08'
  const text = SALT + content + String(timestamp)
  return md5(text)
}
