<script setup lang="ts">
import { login, sendVerifyCode } from '@/api/imaotai/user'
import { getMtAppVersion } from '@/api/other/apple.ts'
import { useImaotaiStore } from '@/stores/modules/imaotai'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  loading?: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:loading', value: boolean): void
  (e: 'login-success'): void
}>()

const imaotaiStore = useImaotaiStore()
const phoneNumber = ref('')
const deviceId = ref('')
const mtVersion = ref('')
const verifyCode = ref('')
const showVerifyCode = ref(false)
const deviceIdLocked = ref(false)
const countdown = ref(0)
const countdownTimer = ref<number | null>(null)
const loginSuccess = ref(false)

// 获取版本号
async function fetchMtVersion() {
  try {
    mtVersion.value = await getMtAppVersion()
  }
  catch (error: any) {
    ElMessage.error(`获取版本号失败：${error.message}`)
  }
}

// 生成新的设备ID
function generateDeviceId() {
  if (deviceIdLocked.value) {
    ElMessage.warning('已发送验证码，不能修改设备ID和手机号码，如需修改，请刷新页面重新配置')
    return
  }
  deviceId.value = uuidv4()
}

// 开始倒计时
function startCountdown() {
  countdown.value = 60
  countdownTimer.value = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value!)
      countdownTimer.value = null
    }
  }, 1000)
}

// 发送验证码成功后的回调
function handleSendCodeSuccess() {
  showVerifyCode.value = true
  deviceIdLocked.value = true
  startCountdown() // 开始倒计时
  ElMessage.success('验证码发送成功，请注意查收')
}

// 手机号码验证
const phoneNumberValid = computed(() => {
  if (!phoneNumber.value)
    return false
  return /^1[3-9]\d{9}$/.test(phoneNumber.value)
})

// 修改发送验证码函数
async function handleSendCode() {
  if (!phoneNumber.value) {
    ElMessage.warning('请输入手机号码')
    return
  }

  if (!phoneNumberValid.value) {
    ElMessage.warning('请输入正确的11位手机号码')
    return
  }

  if (!mtVersion.value) {
    ElMessage.warning('等待获取版本号')
    return
  }

  try {
    emit('update:loading', true)
    await sendVerifyCode(phoneNumber.value, deviceId.value, mtVersion.value)

    // 保存到store
    imaotaiStore.state.phoneNumber = phoneNumber.value
    imaotaiStore.state.deviceId = deviceId.value
    imaotaiStore.state.mtVersion = mtVersion.value

    handleSendCodeSuccess()
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    emit('update:loading', false)
  }
}

// 登录
async function handleLogin() {
  if (!verifyCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }

  try {
    emit('update:loading', true)
    const result = await login({
      mobile: phoneNumber.value,
      vCode: verifyCode.value,
      deviceId: deviceId.value,
      mtVersion: mtVersion.value,
    })

    // 保存登录信息到store
    imaotaiStore.state.userId = result.userId
    imaotaiStore.state.token = result.token
    imaotaiStore.state.cookie = result.cookie

    loginSuccess.value = true // 设置登录成功状态
    ElMessage.success('登录成功')
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    emit('update:loading', false)
  }
}

// 组件加载时获取版本号和生成设备ID
onMounted(() => {
  fetchMtVersion()
  generateDeviceId()
})

// 在组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})
</script>

<template>
  <div>
    <!-- 设备ID和版本号 -->
    <div class="mb-4">
      <div class="font-bold mb-2">
        设备ID：
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="deviceId"
          placeholder="点击生成按钮获取"
          :disabled="deviceIdLocked"
        />
        <el-button
          type="primary"
          class="!min-w-[100px]"
          :disabled="deviceIdLocked"
          @click="generateDeviceId"
        >
          随机生成
        </el-button>
      </div>
      <div
        v-if="deviceIdLocked"
        class="mt-1 text-orange-500 text-sm"
      >
        已发送验证码，设备ID和手机号码已锁定。如需修改，请刷新页面重新配置。
      </div>
    </div>

    <!-- 手机号码输入 -->
    <div class="mb-4">
      <div class="font-bold mb-2">
        手机号码：
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="phoneNumber"
          placeholder="请输入手机号码"
          maxlength="11"
          :disabled="loading || showVerifyCode"
        />
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!phoneNumberValid || countdown > 0 || loginSuccess"
          class="!min-w-[100px]"
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
        </el-button>
      </div>
      <div
        v-if="phoneNumber && !phoneNumberValid"
        class="mt-1 text-red-500 text-sm"
      >
        请输入正确的11位手机号码
      </div>
    </div>

    <!-- 验证码输入 -->
    <div v-if="showVerifyCode" class="mb-4">
      <div class="font-bold mb-2">
        验证码：
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="verifyCode"
          placeholder="请输入验证码"
          maxlength="6"
          :disabled="loading || loginSuccess"
        />
        <el-button
          type="success"
          :loading="loading"
          :disabled="loginSuccess"
          class="!min-w-[100px]"
          @click="handleLogin"
        >
          {{ loginSuccess ? '登录成功' : '登录' }}
        </el-button>
      </div>
    </div>

    <!-- 当前配置预览 -->
    <div class="mt-6 p-4 bg-gray-50 rounded text-sm space-y-1">
      <div class="font-bold mb-2">
        当前配置：
      </div>
      <div>APP版本号（MT_VERSION）：{{ mtVersion || '待设置' }}</div>
      <div>设备ID（DEVICE_ID）：{{ deviceId || '待设置' }}</div>
      <div>手机号码（PHONE_NUMBER）：{{ phoneNumber || '待设置' }}</div>
      <div>用户ID（USER_ID）：{{ imaotaiStore.state.userId || '待设置' }}</div>
      <template v-if="imaotaiStore.state.token && imaotaiStore.state.cookie">
        <div class="mt-2 border-t pt-2">
          <div class="font-bold mb-1">
            登录信息：
          </div>
          <div class="space-y-1">
            <div class="group">
              <div>TOKEN：</div>
              <div class="pl-4 break-all text-gray-600">
                {{ imaotaiStore.state.token }}
              </div>
            </div>
            <div class="group">
              <div>COOKIE：</div>
              <div class="pl-4 break-all text-gray-600">
                {{ imaotaiStore.state.cookie }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bg-gray-50 {
  word-break: break-all;
}

.group:hover {
  background-color: var(--el-fill-color-light);
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  height: 100%;
  padding: 0 15px;
  margin: 0;
  border: none;
  border-radius: 0;
}
</style>
