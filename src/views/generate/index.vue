<script setup lang="ts">
import type { ShopInfo } from '@/api/imaotai/shop'
import { getProductInfo, getShopInfo } from '@/api/imaotai/shop'
import CommonHeader from '@/components/CommonHeader.vue'
import { useImaotaiStore } from '@/stores/modules/imaotai'
import StepFinal from './components/StepFinal.vue'
import StepOne from './components/StepOne.vue'
import StepThree from './components/StepThree.vue'
import StepTwo from './components/StepTwo.vue'

interface ProductItem {
  itemCode: string
  title: string
}

const shopList = ref<ShopInfo[]>([])
const selectedShopId = ref<string>('')
const productList = ref<ProductItem[]>([])
const selectedProducts = ref<string[]>([])
const loading = ref(false)
const activeStep = ref(0)

const imaotaiStore = useImaotaiStore()

// 搜索商店
async function handleSearchShops() {
  try {
    loading.value = true
    shopList.value = await getShopInfo(imaotaiStore.state.province, imaotaiStore.state.city)
    if (shopList.value.length === 0) {
      ElMessage.warning('未找到相关商店')
    }
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}

// 获取可预约商品
async function handleGetProducts() {
  if (!selectedShopId.value) {
    ElMessage.warning('请先选择商店')
    return
  }

  try {
    loading.value = true
    const result = await getProductInfo()
    productList.value = result.itemList
    if (productList.value.length === 0) {
      ElMessage.warning('暂无可预约商品')
    }
  }
  catch (error: any) {
    ElMessage.error(error.message)
  }
  finally {
    loading.value = false
  }
}

// 下一步
function handleNext() {
  if (activeStep.value === 0 && (!selectedShopId.value)) {
    ElMessage.warning('请选择商店')
    return
  }

  // 添加商品选择验证
  if (activeStep.value === 1 && selectedProducts.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }

  activeStep.value++
  if (activeStep.value === 1) {
    handleGetProducts()
  }
}

// 上一步
function handlePrev() {
  activeStep.value--
  if (activeStep.value === 0) {
    selectedProducts.value = []
    productList.value = []
  }
}

// 完成登录，进入最终步骤
function handleComplete() {
  // 检查是否已经登录成功
  if (!imaotaiStore.state.token || !imaotaiStore.state.cookie) {
    ElMessage.warning('请先完成手机号验证码登录，获取 TOKEN 和 COOKIE')
    return
  }

  activeStep.value++
}

// 重新配置
function handleReset() {
  ElMessageBox.confirm(
    '确定要重新配置吗？这将清除所有已填写的信息。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    window.location.reload()
  })
}

// 添加 ref 和监听逻辑
const stepThreeRef = ref()

// 监听 activeStep
watch(activeStep, (newValue) => {
  if (stepThreeRef.value) {
    stepThreeRef.value.isVisible = newValue === 2
  }
})
</script>

<template>
  <div class="h-screen p-4">
    <el-card class="flex flex-col h-full max-w-[940px] mx-auto" body-style="overflow-y: auto;">
      <!-- 卡片头部 -->
      <template #header>
        <CommonHeader
          title="生成新环境变量"
          description="从零开始配置新的环境变量，包括选择商店、商品和登录信息等"
        />
        <div class="mt-8">
          <el-steps :active="activeStep" finish-status="success" class="mb-4" align-center>
            <el-step title="选择商店" description="选择预约商店和缺货模式" />
            <el-step title="选择商品" description="选择需要预约的商品" />
            <el-step title="登录" description="获取验证码、Token等" />
            <el-step title="完成" description="生成环境变量" />
          </el-steps>
        </div>
      </template>

      <!-- 步骤内容 -->
      <StepOne
        v-show="activeStep === 0"
        v-model:selected-shop-id="selectedShopId"
        :shop-list="shopList"
        :loading="loading"
        @search="handleSearchShops"
      />

      <StepTwo
        v-show="activeStep === 1"
        v-model:selected-products="selectedProducts"
        :product-list="productList"
      />

      <StepThree
        v-show="activeStep === 2"
        ref="stepThreeRef"
        v-model:loading="loading"
      />

      <StepFinal
        v-show="activeStep === 3"
      />

      <!-- 卡片底部 -->
      <template #footer>
        <div class="flex justify-between">
          <el-button
            :disabled="activeStep === 0 || activeStep === 3"
            @click="handlePrev"
          >
            上一步
          </el-button>
          <template v-if="activeStep === 3">
            <el-button
              type="warning"
              @click="handleReset"
            >
              重新配置
            </el-button>
          </template>
          <template v-else>
            <el-button
              v-if="activeStep < 2"
              type="primary"
              @click="handleNext"
            >
              下一步
            </el-button>
            <el-button
              v-else-if="activeStep === 2"
              type="success"
              @click="handleComplete"
            >
              生成环境变量
            </el-button>
          </template>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
}

:deep(.el-card__body) {
  flex: 1;
  padding-bottom: 0;
  overflow: hidden;
}

:deep(.el-card__footer) {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-light);
}

:deep(.el-card__header) {
  padding-bottom: 0;
}

:deep(.el-icon) {
  display: inline-flex;
  align-items: center;
}
</style>
