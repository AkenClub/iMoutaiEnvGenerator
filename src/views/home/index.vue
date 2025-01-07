<script setup lang="ts">
onMounted(() => {
  console.log('mounted')
  ElMessage.success('测试')
})
</script>

<template>
  <div class="bg-amber-200 w-1/2 h-600 text-soft">
    <div>测试</div>
    <!-- 直接使用 SVG -->
    <IMineArrow style="color: blue" height="60px" width="60px" />
    <!-- 使用 el-icon -->
    <el-icon size="50px" color="#ff0000" class="is-loading">
      <IMineArrow />
    </el-icon>
    <el-icon size="50px" color="#ff0000">
      <!-- 使用 Element ui icon -->
      <IEpStar />
    </el-icon>
  </div>
</template>
