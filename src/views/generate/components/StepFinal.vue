<script setup lang="ts">
import { useImaotaiStore } from '@/stores/modules/imaotai'
import { useUserStore } from '@/stores/modules/user'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { computed, reactive, ref, watch } from 'vue'

const imaotaiStore = useImaotaiStore()
const userStore = useUserStore()

const ENV_NAME = 'KEN_IMAOTAI_ENV'
const envValue = computed(() => imaotaiStore.generateEnvString())
const envName = computed(() => ENV_NAME)

// 编辑模式状态
const editMode = reactive({
  name: false,
  value: false,
})

// 编辑中的值
const editingName = ref(ENV_NAME)
const editingValue = ref('')

// 监听 envValue 变化，更新编辑值
watch(envValue, (newValue) => {
  editingValue.value = newValue
}, { immediate: true })

// 添加保存相关的变量
const saveDialogVisible = ref(false)
const saveName = ref('')

// 复制文本
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 添加保存相关的方法
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

  // 保存环境变量
  userStore.saveEnv({
    env: envValue.value,
    date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    remark: saveName.value,
    type: 'add',
    uuid: uuidv4(),
  })

  saveDialogVisible.value = false
  saveName.value = ''
  ElMessage.success('保存成功')
}
</script>

<template>
  <div>
    <div class="mb-6">
      请将以下环境变量添加到青龙面板环境变量中。指引：青龙面板左侧导航栏 -> 环境变量 -> 创建变量。
    </div>

    <!-- 变量名称 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="font-bold">
            名称：
          </div>
        </div>
        <el-button
          type="primary"
          link
          :disabled="!envName"
          @click="() => editMode.name = !editMode.name"
        >
          {{ editMode.name ? '完成' : '编辑' }}
        </el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="editingName"
          :disabled="!editMode.name"
        />
      </div>
      <el-button
        type="success"
        class="mt-2 w-full"
        :disabled="!editingName"
        @click="() => copyText(editingName)"
      >
        复制
      </el-button>
    </div>

    <!-- 自动拆分 -->
    <div class="mb-6">
      <div class="font-bold mb-2">
        自动拆分：
      </div>
      <div class="flex items-center gap-2">
        否
      </div>
    </div>

    <!-- 变量值 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="font-bold">
            值：
          </div>
        </div>
        <el-button
          type="primary"
          link
          :disabled="!envValue"
          @click="() => editMode.value = !editMode.value"
        >
          {{ editMode.value ? '完成' : '编辑' }}
        </el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="editingValue"
          :disabled="!editMode.value"
          type="textarea"
          :rows="6"
        />
      </div>
      <el-button
        type="success"
        class="mt-2 w-full"
        :disabled="!editingValue"
        @click="() => copyText(editingValue)"
      >
        复制
      </el-button>
      <el-button
        type="primary"
        class="mt-4 w-full !ml-0"
        :disabled="!editingValue"
        @click="handleSave"
      >
        保存到历史记录
      </el-button>
    </div>

    <!-- 预览信息 -->
    <div class="mb-4">
      <div class="font-bold mb-2">
        预览信息：
      </div>
      <div class="bg-gray-50 p-4 rounded space-y-2 text-sm">
        <div>手机号码 (PHONE_NUMBER)：{{ imaotaiStore.state.phoneNumber }}</div>
        <div>用户ID (USER_ID)：{{ imaotaiStore.state.userId }}</div>
        <div>设备ID (DEVICE_ID)：{{ imaotaiStore.state.deviceId }}</div>
        <div>版本号 (MT_VERSION)：{{ imaotaiStore.state.mtVersion }}</div>
        <div>商品ID列表 (PRODUCT_ID_LIST)：{{ imaotaiStore.state.productIdList }}</div>
        <div>
          店铺信息 (SHOP_ID^SHOP_MODE^PROVINCE^CITY)：
          {{ imaotaiStore.state.shopId }}^{{ imaotaiStore.state.shopMode }}^{{ imaotaiStore.state.province }}^{{ imaotaiStore.state.city }}
        </div>
        <div>纬度 (LAT)：{{ imaotaiStore.state.lat }}</div>
        <div>经度 (LNG)：{{ imaotaiStore.state.lng }}</div>
        <div class="group">
          <div>TOKEN：</div>
          <div class="break-all text-gray-600 bg-white p-2 rounded text-sm font-mono">
            {{ imaotaiStore.state.token }}
          </div>
        </div>
        <div class="group">
          <div>COOKIE：</div>
          <div class="break-all text-gray-600 bg-white p-2 rounded text-sm font-mono">
            {{ imaotaiStore.state.cookie }}
          </div>
        </div>
      </div>
    </div>

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
</template>

<style scoped>
.bg-gray-50 {
  word-break: break-all;
}

.group:hover {
  background-color: var(--el-fill-color-light);
}
</style>
