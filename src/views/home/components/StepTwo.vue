<script setup lang="ts">
import { useImaotaiStore } from '@/stores/modules/imaotai'
import { computed, watch } from 'vue'

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const imaotaiStore = useImaotaiStore()

interface Props {
  productList: Array<{
    itemCode: string
    title: string
  }>
  selectedProducts: string[]
}

interface Emits {
  (e: 'update:selectedProducts', value: string[]): void
}

// 本地状态
const localSelectedProducts = computed({
  get: () => props.selectedProducts,
  set: value => emit('update:selectedProducts', value),
})

// 格式化商品ID列表
const formattedProductIds = computed(() => {
  if (!props.selectedProducts.length)
    return ''
  return `['${props.selectedProducts.join('\',\'')}']`
})

// 监听选择变化，保存到 store
watch(() => props.selectedProducts, () => {
  // 直接存储格式化后的商品列表
  imaotaiStore.state.productIdList = formattedProductIds.value
}, { deep: true })

// 验证是否选择了商品
const validateProducts = computed(() => {
  if (!props.selectedProducts.length) {
    return '请至少选择一个商品'
  }
  return ''
})
</script>

<template>
  <div>
    <template v-if="productList.length > 0">
      <div class="my-4">
        <div class="font-bold mb-2">
          选择商品：
        </div>
        <el-checkbox-group v-model="localSelectedProducts">
          <div v-for="product in productList" :key="product.itemCode" class="mb-2">
            <el-checkbox :value="product.itemCode">
              {{ product.title }} ({{ product.itemCode }})
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <!-- 显示校验信息 -->
        <div
          v-if="validateProducts"
          class="mt-2 text-red-500 text-sm"
        >
          {{ validateProducts }}
        </div>
      </div>
    </template>

    <!-- 当前配置预览 -->
    <div class="mt-6 p-4 bg-gray-50 rounded text-sm space-y-1">
      <div class="font-bold mb-2">
        当前配置：
      </div>
      <div>商品ID列表（PRODUCT_ID_LIST）：{{ formattedProductIds || '未选择' }}</div>
    </div>
  </div>
</template>
