<script setup lang="ts">
import { useRouter } from 'vue-router'
import CommonHeader from '../../components/CommonHeader.vue'

const router = useRouter()

function handleNavigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="h-screen p-4">
    <el-card class="flex flex-col h-full max-w-[940px] mx-auto" body-style="overflow-y: auto;">
      <template #header>
        <CommonHeader />
      </template>

      <div class="flex-1 flex flex-col items-center justify-center gap-20 mt-20">
        <el-card
          class="w-96 cursor-pointer hover:shadow-lg transition-shadow h-[150px]"
          @click="handleNavigate('/generate')"
        >
          <template #header>
            <div class="font-bold flex items-center gap-2">
              <span class="text-xl">🆕</span>
              <span class="text-lg">生成新环境变量</span>
            </div>
          </template>
          <div class="text-gray-600 flex items-start gap-2">
            <span>从零开始配置新的环境变量，包括选择商店、商品和登录信息等。</span>
          </div>
        </el-card>

        <el-card
          class="w-96 cursor-pointer hover:shadow-lg transition-shadow h-[150px]"
          @click="handleNavigate('/update')"
        >
          <template #header>
            <div class="font-bold flex items-center gap-2">
              <span class="text-xl">⚡</span>
              <span class="text-lg">更新已有环境变量</span>
            </div>
          </template>
          <div class="text-gray-600 flex items-start gap-2">
            <span>导入并更新现有的环境变量，快速修改配置信息。</span>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  flex: 1;
  padding-bottom: 0;
  overflow: hidden;
}

:deep(.el-card__header) {
  padding-bottom: 16px;
}
</style>
