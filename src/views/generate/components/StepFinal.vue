<script setup lang="ts">
import { useImaotaiStore } from '@/stores/modules/imaotai'
import { computed, reactive, ref, watch } from 'vue'

const imaotaiStore = useImaotaiStore()

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

// 复制文本
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
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
