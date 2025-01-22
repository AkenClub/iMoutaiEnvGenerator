<script setup lang="ts">
import type { ImaotaiState } from '@/stores/modules/imaotai.ts'
import { login, sendVerifyCode } from '@/api/imaotai/user'
import CommonHeader from '@/components/CommonHeader.vue'
import { useUserStore } from '@/stores/modules/user'
import { Check, Timer } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface UserEnv extends ImaotaiState {
  id: number
  loginSuccess?: boolean
}

const envInput = ref('')
const isValidJson = ref(true)
const errorMessage = ref('')
const loading = ref(false)
const showLoginForm = ref(false)
const verifyCode = ref('')
const countdown = ref(0)
const countdownTimer = ref<number | null>(null)

// 存储多个用户的环境变量
const users = ref<UserEnv[]>([])
// 当前选中的用户
const currentUser = ref<UserEnv | null>(null)

// 导入状态
const isImported = ref(false)

// 添加新的响应式变量
const userStore = useUserStore()
const saveDialogVisible = ref(false)
const saveName = ref('')

// 添加路由相关代码
const route = useRoute()

// 添加新的响应式变量
const currentHistoryUuid = ref('')

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    if (query.uuid && typeof query.uuid === 'string') {
      // 通过 uuid 获取历史记录
      const historyItem = userStore.getHistoryByUuid(query.uuid)
      if (historyItem) {
        currentHistoryUuid.value = query.uuid
        envInput.value = historyItem.env
        handleImportEnv()
      }
    }
    else if (query.env && typeof query.env === 'string') {
      envInput.value = query.env
      handleImportEnv()
    }
  },
  { immediate: true },
)

// 解析并导入环境变量
function handleImportEnv() {
  try {
    // 分割多用户环境变量
    const userEnvs = envInput.value.split('&')
    users.value = []

    userEnvs.forEach((userEnv, index) => {
      // 判断是否为旧版格式（使用 $ 分隔）
      const isOldFormat = userEnv.includes('$') && !userEnv.includes('#')
      const parts = userEnv.split(isOldFormat ? '$' : '#')

      if (parts.length !== 10) {
        throw new Error(`用户${index + 1}的环境变量格式不正确`)
      }

      // 解析店铺信息
      const [shopId, shopMode, province, city] = parts[5].split('^')

      // 创建用户环境变量对象
      users.value.push({
        id: index + 1,
        phoneNumber: parts[0],
        userId: parts[1],
        deviceId: parts[2],
        mtVersion: parts[3],
        productIdList: parts[4],
        shopId,
        shopMode,
        province,
        city,
        lat: parts[6],
        lng: parts[7],
        token: parts[8],
        cookie: parts[9],
        loginSuccess: false,
      })
    })

    isValidJson.value = true
    errorMessage.value = ''
    showLoginForm.value = true
    isImported.value = true
    ElMessage.success(`成功解析 ${users.value.length} 个用户的环境变量`)
  }
  catch (error: any) {
    console.log(error)
    isValidJson.value = false
    errorMessage.value = error.message || '环境变量格式不正确，请检查格式'
    showLoginForm.value = false
  }
}

// 选择用户
function handleSelectUser(user: UserEnv) {
  currentUser.value = user
  verifyCode.value = ''
  countdown.value = 0
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
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

// 发送验证码
async function handleSendCode() {
  if (!currentUser.value) {
    ElMessage.warning('请先选择用户')
    return
  }

  try {
    loading.value = true
    await sendVerifyCode(
      currentUser.value.phoneNumber,
      currentUser.value.deviceId,
      currentUser.value.mtVersion,
    )
    startCountdown()
    ElMessage.success('验证码发送成功，请注意查收')
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}

// 登录
async function handleLogin() {
  if (!currentUser.value || !verifyCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }

  try {
    loading.value = true
    const result = await login({
      mobile: currentUser.value.phoneNumber,
      vCode: verifyCode.value,
      deviceId: currentUser.value.deviceId,
      mtVersion: currentUser.value.mtVersion,
    })

    // 更新登录信息
    currentUser.value.userId = result.userId
    currentUser.value.token = result.token
    currentUser.value.cookie = result.cookie
    currentUser.value.loginSuccess = true

    ElMessage.success('登录成功，Token 和 Cookie 已更新')
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}

// 生成新的环境变量
const generateNewEnv = computed(() => {
  if (!showLoginForm.value || users.value.length === 0)
    return ''

  return users.value.map(user => [
    user.phoneNumber,
    user.userId,
    user.deviceId,
    user.mtVersion,
    user.productIdList,
    `${user.shopId}^${user.shopMode}^${user.province}^${user.city}`,
    user.lat,
    user.lng,
    user.token,
    user.cookie,
  ].join('#')).join('&')
})

// 复制文本
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})

// 重置所有状态
function handleReset() {
  ElMessageBox.confirm(
    '重置将清空所有已导入和更新的数据，是否确认重置？',
    '提示',
    {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    envInput.value = ''
    isValidJson.value = true
    errorMessage.value = ''
    showLoginForm.value = false
    verifyCode.value = ''
    countdown.value = 0
    users.value = []
    currentUser.value = null
    isImported.value = false

    if (countdownTimer.value) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }

    ElMessage.success('已重置所有数据')
  }).catch(() => {
    // 用户取消重置，不做任何操作
  })
}

// 添加新的方法
function handleSave() {
  // 设置默认名称
  saveName.value = `${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
  saveDialogVisible.value = true
}

function confirmSave() {
  if (!saveName.value.trim()) {
    ElMessage.warning('请输入保存名称')
    return
  }

  // 保存所有更新后的用户环境变量
  userStore.saveEnv({
    env: generateNewEnv.value,
    date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    remark: saveName.value,
    type: 'update',
    uuid: uuidv4(),
  })

  saveDialogVisible.value = false
  saveName.value = ''
  ElMessage.success('保存成功')
}

// 更新历史记录
function handleUpdateHistory() {
  if (!currentHistoryUuid.value)
    return

  const historyItem = userStore.getHistoryByUuid(currentHistoryUuid.value)
  if (!historyItem)
    return

  ElMessageBox.confirm(
    `确定要更新"${historyItem.remark}"的环境变量吗？`,
    '更新确认',
    {
      confirmButtonText: '确定更新',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    userStore.updateEnv(currentHistoryUuid.value, {
      env: generateNewEnv.value,
    })
    ElMessage.success('更新成功')
  }).catch(() => {
    // 用户取消更新，不做任何操作
  })
}

// 添加计算属性获取当前历史记录
const currentHistory = computed(() => {
  if (!currentHistoryUuid.value)
    return null
  return userStore.sortedHistoryEnvList.find(item => item.uuid === currentHistoryUuid.value)
})

// 计算标题
const pageTitle = computed(() => {
  if (currentHistory.value) {
    return `更新 - ${currentHistory.value.remark}`
  }
  return '更新已有环境变量'
})

// 计算描述
const pageDescription = computed(() => {
  if (currentHistory.value) {
    return `保存时间：${currentHistory.value.date}`
  }
  return '导入并更新现有的环境变量，快速修改配置信息。'
})
</script>

<template>
  <div class="h-screen p-4">
    <el-card class="flex flex-col h-full max-w-[940px] mx-auto" body-style="overflow-y: auto;">
      <template #header>
        <CommonHeader :title="pageTitle" :description="pageDescription" />
      </template>

      <div class="flex-1 flex flex-col gap-6 p-4">
        <!-- 导入环境变量 -->
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">
            第一步：导入现有环境变量（支持多用户）
          </h3>
          <p class="text-gray-500 text-sm mb-4">
            请将现有的 KEN_IMAOTAI_ENV 环境变量粘贴到下方文本框中（支持新版 # 分隔和旧版 $ 分隔格式，多用户请用 & 分隔）
          </p>
          <el-input
            v-model="envInput"
            type="textarea"
            :rows="6"
            placeholder="请粘贴环境变量..."
            :status="isValidJson ? '' : 'error'"
            :disabled="isImported"
          />
          <div v-if="!isValidJson" class="text-red-500 text-sm mt-2">
            {{ errorMessage }}
          </div>
          <div v-else-if="isImported" class="text-green-600 text-sm mt-2">
            环境变量已导入成功，如需重新导入请点击重置按钮
          </div>
          <div class="flex items-center gap-2 mt-4">
            <el-button
              type="primary"
              :disabled="isImported"
              @click="handleImportEnv"
            >
              导入环境变量
            </el-button>
            <el-button
              type="warning"
              @click="handleReset"
            >
              重置
            </el-button>
          </div>
        </div>

        <!-- 环境变量信息预览 -->
        <template v-if="showLoginForm">
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">
              环境变量信息预览
            </h3>
            <div class="bg-gray-50 p-4 rounded space-y-4">
              <!-- 用户列表 -->
              <div v-for="user in users" :key="user.id" class="border-b last:border-b-0 pb-4 last:pb-0">
                <el-collapse>
                  <el-collapse-item>
                    <template #title>
                      <div class="flex items-center gap-4">
                        <div class="text-base font-medium">
                          用户 {{ user.id }}
                        </div>
                        <div class="text-base text-gray-600">
                          {{ user.phoneNumber }}
                        </div>
                      </div>
                    </template>
                    <div class="space-y-3 pl-2 pt-2">
                      <!-- 基本信息 -->
                      <div class="space-y-2">
                        <div class="font-medium text-gray-500">
                          基本信息
                        </div>
                        <div class="grid grid-cols-2 gap-x-8 gap-y-2 pl-4">
                          <div>用户ID：{{ user.userId }}</div>
                          <div>设备ID：{{ user.deviceId }}</div>
                          <div>版本号：{{ user.mtVersion }}</div>
                          <div>商品列表：{{ user.productIdList }}</div>
                        </div>
                      </div>

                      <!-- 店铺信息 -->
                      <div class="space-y-2">
                        <div class="font-medium text-gray-500">
                          店铺信息
                        </div>
                        <div class="grid grid-cols-2 gap-x-8 gap-y-2 pl-4">
                          <div>店铺ID：{{ user.shopId }}</div>
                          <div>缺货模式：{{ user.shopMode }}</div>
                          <div>省份：{{ user.province }}</div>
                          <div>城市：{{ user.city }}</div>
                          <div>纬度：{{ user.lat }}</div>
                          <div>经度：{{ user.lng }}</div>
                        </div>
                      </div>

                      <!-- 登录信息 -->
                      <div class="space-y-2">
                        <div class="font-medium text-gray-500">
                          登录信息
                        </div>
                        <div class="space-y-2 pl-4">
                          <div>
                            <div class="mb-1">
                              TOKEN：
                            </div>
                            <div class="bg-white p-2 rounded text-gray-600 break-all text-sm font-mono">
                              {{ user.token }}
                            </div>
                          </div>
                          <div>
                            <div class="mb-1">
                              COOKIE：
                            </div>
                            <div class="bg-white p-2 rounded text-gray-600 break-all text-sm font-mono">
                              {{ user.cookie }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>

          <!-- 登录表单 -->
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">
              第二步：重新登录获取 Token
            </h3>
            <p class="text-gray-500 text-sm mb-4">
              请依次为每个用户重新登录，更新 Token 和 Cookie
            </p>

            <!-- 用户选择 -->
            <div class="mb-4">
              <div class="font-medium mb-2">
                选择要更新的用户：
              </div>
              <div class="flex flex-wrap gap-2">
                <el-button
                  v-for="user in users"
                  :key="user.id"
                  :type="currentUser?.id === user.id ? 'primary' : 'default'"
                  class="!flex items-center"
                  @click="handleSelectUser(user)"
                >
                  <span>用户{{ user.id }} ({{ user.phoneNumber }})</span>
                  <template v-if="user.loginSuccess">
                    <el-icon class="ml-2 ">
                      <Check />
                    </el-icon>
                  </template>
                  <template v-else>
                    <el-icon class="ml-2 ">
                      <Timer />
                    </el-icon>
                  </template>
                </el-button>
              </div>
            </div>

            <template v-if="currentUser">
              <div class="space-y-6">
                <template v-if="currentUser.loginSuccess">
                  <!-- 登录成功状态 -->
                  <div class="bg-green-50 text-green-600 p-4 rounded">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">用户 {{ currentUser.id }} ({{ currentUser.phoneNumber }}) 登录成功</span>
                    </div>
                    <div class="text-sm mt-2">
                      该用户的 Token 和 Cookie 已更新，请继续更新其他用户或复制最终环境变量。
                    </div>
                  </div>
                </template>

                <template v-else>
                  <!-- 1. 发送验证码 -->
                  <div>
                    <div class="font-medium mb-2">
                      1. 发送验证码到 {{ currentUser.phoneNumber }}
                    </div>
                    <el-button
                      type="primary"
                      :loading="loading"
                      :disabled="countdown > 0"
                      class="!min-w-[120px]"
                      @click="handleSendCode"
                    >
                      {{ countdown > 0 ? `${countdown}s 后重新发送` : '发送验证码' }}
                    </el-button>
                  </div>

                  <!-- 2. 输入验证码并登录 -->
                  <div>
                    <div class="font-medium mb-2">
                      2. 输入验证码并登录
                    </div>
                    <div class="flex items-center gap-2">
                      <el-input
                        v-model="verifyCode"
                        placeholder="请输入验证码"
                        maxlength="6"
                        :disabled="loading || countdown === 0"
                      />
                      <el-button
                        type="success"
                        :loading="loading"
                        :disabled="!verifyCode || countdown === 0"
                        class="!min-w-[100px]"
                        @click="handleLogin"
                      >
                        登录
                      </el-button>
                    </div>
                    <div v-if="countdown === 0" class="mt-2 text-orange-500 text-sm">
                      请先发送验证码
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </div>

          <!-- 更新后的环境变量 -->
          <div v-if="users.some(user => user.loginSuccess)" class="mb-4">
            <div class="flex items-center mb-2">
              <h3 class="text-lg font-medium">
                第三步：复制更新后的环境变量
              </h3>
            </div>

            <!-- 未完成提示 -->
            <div
              v-if="users.some(user => !user.loginSuccess)"
              class="mb-4 bg-orange-50 text-orange-600 p-4 rounded"
            >
              <div class="font-medium">
                尚有 {{ users.filter(u => !u.loginSuccess).length }} 个用户未更新，建议完成所有用户更新后再复制
              </div>
            </div>

            <!-- 所有完成提示 -->
            <div v-else class="mb-4 bg-green-50 text-green-600 p-4 rounded">
              <div class="font-medium">
                所有用户已更新，请复制最终环境变量
              </div>
              <div class="text-sm mt-1">
                复制后，请将环境变量粘贴到青龙面板的 KEN_IMAOTAI_ENV 环境变量值中。
              </div>
            </div>

            <el-input
              :model-value="generateNewEnv"
              type="textarea"
              :rows="6"
              readonly
            />

            <el-button
              type="success"
              class="mt-4 w-full"
              @click="copyText(generateNewEnv)"
            >
              复制环境变量
            </el-button>

            <!-- 根据是否有 uuid 显示不同的按钮 -->
            <template v-if="currentHistoryUuid">
              <el-button
                type="warning"
                class="mt-4 w-full !ml-0"
                @click="handleUpdateHistory"
              >
                更新此历史记录
              </el-button>
              <el-button
                type="primary"
                class="mt-4 w-full !ml-0"
                @click="handleSave"
              >
                另存为新记录
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                class="mt-4 w-full !ml-0"
                @click="handleSave"
              >
                保存到历史记录
              </el-button>
            </template>
          </div>
        </template>

        <!-- 添加保存对话框 -->
        <el-dialog
          v-model="saveDialogVisible"
          title="保存环境变量"
          width="400px"
        >
          <el-form>
            <el-form-item label="保存名称">
              <el-input
                v-model="saveName"
                placeholder="请输入保存名称"
                maxlength="50"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="saveDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmSave">
                确认保存
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
:deep(.el-collapse) {
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;

  border: none;
}

:deep(.el-collapse-item__header) {
  font-size: inherit;
  font-weight: inherit;
  border-bottom: none;
}

:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
  color: var(--el-text-color-primary);
}
</style>
