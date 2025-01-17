<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'ken-iMoutai-Script 项目环境变量生成助手',
  description: '傻瓜式生成新的 KEN_IMAOTAI_ENV 环境变量，同时支持旧环境变量的更新。',
})
const router = useRouter()
const route = useRoute()

function handleBack() {
  ElMessageBox.confirm(
    '返回首页后，当前页面的修改将会丢失，是否确认返回？',
    '提示',
    {
      confirmButtonText: '确认返回',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    router.push('/')
  }).catch(() => {})
}

const showBackButton = computed(() => route.path !== '/')
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <el-button
        v-if="showBackButton"
        type="default"
        class="!flex items-center gap-1 !px-2"
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div>
        <div class="font-bold text-2xl">
          {{ title }}
        </div>
        <div class="text-gray-500 mt-1 text-sm">
          {{ description }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-8">
      <a
        href="https://github.com/AkenClub/iMoutaiEnvGenerator"
        target="_blank"
        class="text-gray-600 hover:text-gray-900"
        title="查看本项目源码"
      >
        <el-icon class="text-4xl">
          <IMineGithub />
        </el-icon>
        <span class="ml-1 text-sm">本生成助手源码</span>
      </a>
      <a
        href="https://github.com/AkenClub/ken-iMoutai-Script#环境变量示例"
        target="_blank"
        class="text-gray-600 hover:text-gray-900"
        title="查看配套 ken-iMoutai-Script 脚本项目源码"
      >
        <el-icon class="text-4xl">
          <IMineGithub />
        </el-icon>
        <span class="ml-1 text-sm">ken-iMoutai-Script 源码</span>
      </a>
    </div>
  </div>
</template>
