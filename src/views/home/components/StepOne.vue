<script setup lang="ts">
import type { ShopInfo } from '@/api/imaotai/shop.ts'
import { useImaotaiStore } from '@/stores/modules/imaotai'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'

interface Props {
  shopList: ShopInfo[]
  selectedShopId: string
  loading: boolean
}

interface Emits {
  (e: 'update:selectedShopId', value: string): void
  (e: 'search'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const imaotaiStore = useImaotaiStore()

// 最近商店的ID
const nearestShopId = ref('')

// 预约店铺ID
const localSelectedShopId = computed({
  get: () => props.selectedShopId,
  set: value => emit('update:selectedShopId', value),
})

// 获取选中的店铺信息
const selectedNearestShop = computed(() =>
  props.shopList.find(shop => shop.shopId === nearestShopId.value),
)

// 初始化默认值
onMounted(() => {
  imaotaiStore.state.province = ''
  imaotaiStore.state.city = ''
  imaotaiStore.state.shopMode = 'NEAREST'
})

// 监听最近商店的选择
watch(nearestShopId, (newValue) => {
  if (newValue) {
    // 自动设置为预约店铺
    localSelectedShopId.value = newValue

    // 更新店铺相关信息到 store
    if (selectedNearestShop.value) {
      const shop = selectedNearestShop.value
      imaotaiStore.state.lat = shop.lat
      imaotaiStore.state.lng = shop.lng
      imaotaiStore.state.shopId = newValue
    }
  }
  else {
    // 清空店铺相关信息
    imaotaiStore.state.lat = ''
    imaotaiStore.state.lng = ''
  }
})

// 监听预约店铺ID
watch(localSelectedShopId, (newValue) => {
  imaotaiStore.state.shopId = newValue || ''

  // 如果选择了 AUTO，确保有缺货模式
  if (newValue === 'AUTO' && imaotaiStore.state.shopMode === '') {
    imaotaiStore.state.shopMode = 'NEAREST'
  }

  // 如果选择了最近商店，更新经纬度
  if (newValue === nearestShopId.value && selectedNearestShop.value) {
    const shop = selectedNearestShop.value
    imaotaiStore.state.lat = shop.lat
    imaotaiStore.state.lng = shop.lng
  }
})

// 重置选择时清空数据
watch(() => props.shopList, () => {
  nearestShopId.value = ''
  localSelectedShopId.value = ''
  imaotaiStore.state.lat = ''
  imaotaiStore.state.lng = ''
  imaotaiStore.state.shopId = ''
  imaotaiStore.state.shopMode = 'NEAREST'
}, { deep: true })

// 校验逻辑
const validateShopMode = computed(() => {
  if (localSelectedShopId.value === 'AUTO' && imaotaiStore.state.shopMode === '') {
    return '当预约店铺设置为 AUTO 时，必须选择缺货模式'
  }
  return ''
})

// 搜索前验证
function handleSearch() {
  if (!imaotaiStore.state.province || !imaotaiStore.state.city) {
    ElMessage.warning('请输入省份和城市')
    return
  }

  emit('search')
}
</script>

<template>
  <div>
    <el-form>
      <div class="flex items-center gap-8">
        <el-form-item label="省份" class="flex-1 !mb-0">
          <el-input
            v-model="imaotaiStore.state.province"
            placeholder="请输入省份，例如：广东省"
          />
        </el-form-item>
        <el-form-item label="城市" class="flex-1 !mb-0">
          <el-input
            v-model="imaotaiStore.state.city"
            placeholder="请输入城市，例如：深圳市"
          />
        </el-form-item>
        <el-form-item class="!mb-0">
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSearch"
          >
            搜索商店
          </el-button>
        </el-form-item>
      </div>
    </el-form>

    <template v-if="shopList.length > 0">
      <!-- 选择最近商店 -->
      <div class="my-4">
        <div class="font-bold mb-2">
          选择离你最近的商店（获取纬度LAT、经度LNG）：
        </div>
        <el-select
          v-model="nearestShopId"
          placeholder="请选择最近的商店"
          class="w-full"
        >
          <el-option
            v-for="shop in shopList"
            :key="shop.shopId"
            :label="`[${shop.shopId}] ${shop.name} (${shop.fullAddress})`"
            :value="shop.shopId"
          />
        </el-select>
      </div>

      <!-- 选择预约店铺和缺货模式 -->
      <template v-if="nearestShopId">
        <div class="my-4">
          <div class="font-bold mb-2">
            预约店铺（SHOP_ID）：
          </div>
          <el-radio-group v-model="localSelectedShopId" class="flex flex-col">
            <div class="mb-2 w-full">
              <el-radio :value="nearestShopId" class="!flex w-full">
                <div class="truncate">
                  <span class="mr-2">（推荐）使用上面选择的离你最近的商店</span>
                  <span class="text-gray-500">({{ nearestShopId }})</span>
                </div>
              </el-radio>
            </div>

            <div class="mb-2 w-full">
              <el-radio value="AUTO" class="!flex w-full">
                <div class="truncate">
                  <span class="mr-2">AUTO</span>
                  <span class="text-gray-500">(根据 SHOP_MODE 的值来选择店铺 ID)</span>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>

        <div class="my-4">
          <div class="font-bold mb-2">
            店铺缺货模式（SHOP_MODE）：
          </div>
          <el-radio-group
            v-model="imaotaiStore.state.shopMode"
            class="flex flex-col space-y-2"
          >
            <el-radio
              value=""
              class="!flex items-start"
              :disabled="localSelectedShopId === 'AUTO'"
            >
              <div>
                <span>不选择其他店铺</span>
                <span class="text-gray-500 text-sm">（空值）</span>
                <template v-if="localSelectedShopId === 'AUTO'">
                  <el-tag size="small" type="danger" class="ml-2">
                    AUTO 模式下不可选
                  </el-tag>
                </template>
              </div>
            </el-radio>
            <el-radio value="NEAREST" class="!flex items-start">
              <div>
                <span>选择距离最近的店铺</span>
                <span class="text-gray-500 text-sm">（NEAREST）</span>
              </div>
            </el-radio>
            <el-radio value="INVENTORY" class="!flex items-start">
              <div>
                <span>选择库存最多的店铺</span>
                <span class="text-gray-500 text-sm">（INVENTORY）</span>
              </div>
            </el-radio>
          </el-radio-group>
          <div
            v-if="validateShopMode"
            class="mt-2 text-red-500 text-sm"
          >
            {{ validateShopMode }}
          </div>
        </div>

        <!-- 当前配置预览 -->
        <div class="mt-6 p-4 bg-gray-50 rounded text-sm space-y-1">
          <div class="font-bold mb-2">
            当前配置：
          </div>
          <div>省份（PROVINCE）：{{ imaotaiStore.state.province }}</div>
          <div>城市（CITY）：{{ imaotaiStore.state.city }}</div>
          <div>预约店铺（SHOP_ID）：{{ imaotaiStore.state.shopId }}</div>
          <div>缺货模式（SHOP_MODE）：{{ imaotaiStore.state.shopMode || '未设置' }}</div>
          <div>纬度（LAT）：{{ imaotaiStore.state.lat || '未设置' }}</div>
          <div>经度（LNG）：{{ imaotaiStore.state.lng || '未设置' }}</div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
:deep(.el-radio) {
  width: 100%;
  padding: 8px 12px;
  margin-right: 0;
  border-radius: 4px;
}

:deep(.el-radio:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-radio.is-checked) {
  background-color: var(--el-fill-color);
}

:deep(.el-form-item__label) {
  padding-right: 8px;
}
</style>
