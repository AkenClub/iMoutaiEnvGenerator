<script setup lang="ts">
import { type UserEnvHistory, useUserStore } from '@/stores/modules/user'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CommonHeader from '../../components/CommonHeader.vue'

const router = useRouter()
const userStore = useUserStore()

// 添加编辑相关的响应式变量
const editingRemark = ref('')
const editDialogVisible = ref(false)
const editingUuid = ref('')

function handleNavigate(path: string) {
  router.push(path)
}

// 使用历史环境变量
function handleUseHistory(uuid: string) {
  router.push({
    path: '/update',
    query: {
      uuid,
    },
  })
}

// 格式化日期
function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 删除历史记录
function handleDelete(uuid: string) {
  ElMessageBox.confirm(
    '确定要删除这条历史记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    const index = userStore.historyEnvList.findIndex(item => item.uuid === uuid)
    if (index !== -1) {
      userStore.historyEnvList.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消删除，不做任何操作
  })
}

// 开始编辑备注
function handleEditRemark(item: UserEnvHistory) {
  editingRemark.value = item.remark
  editingUuid.value = item.uuid
  editDialogVisible.value = true
}

// 确认编辑
function confirmEdit() {
  if (!editingRemark.value.trim()) {
    ElMessage.warning('请输入备注名称')
    return
  }

  userStore.updateEnv(editingUuid.value, {
    remark: editingRemark.value,
  })

  editDialogVisible.value = false
  editingRemark.value = ''
  editingUuid.value = ''
  ElMessage.success('修改成功')
}

// 添加清空所有方法
function handleClearAll() {
  if (userStore.sortedHistoryEnvList.length === 0) {
    ElMessage.warning('暂无历史记录')
    return
  }

  ElMessageBox.confirm(
    '确定要清空所有历史环境变量吗？此操作不可恢复！',
    '清空确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
    userStore.clearHistory()
    ElMessage.success('已清空所有历史记录')
  }).catch(() => {
    // 用户取消清空，不做任何操作
  })
}
</script>

<template>
  <div class="h-screen p-4">
    <el-card class="flex flex-col h-full max-w-[940px] mx-auto" body-style="overflow-y: auto;">
      <template #header>
        <CommonHeader />
      </template>

      <div class="flex-1 flex flex-col gap-8 p-4">
        <!-- 操作卡片 -->
        <div class="grid grid-cols-2 gap-6">
          <el-card
            class="cursor-pointer hover:shadow-lg transition-shadow h-[150px]"
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
            class="cursor-pointer hover:shadow-lg transition-shadow h-[150px]"
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

        <!-- 历史记录 -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-4">
            <div class="font-bold text-lg flex items-center gap-2">
              <span class="text-xl">📋</span>
              <span>历史环境变量</span>
            </div>
            <el-button
              type="danger"
              link
              @click="handleClearAll"
            >
              清空所有
            </el-button>
          </div>

          <el-collapse>
            <el-collapse-item
              v-for="item in userStore.sortedHistoryEnvList"
              :key="item.uuid"
            >
              <template #title>
                <div class="flex items-center w-full pr-4">
                  <div class="flex items-center gap-4 flex-1">
                    <el-tag :type="item.type === 'add' ? 'success' : 'warning'" size="small">
                      {{ item.type === 'add' ? '新增' : '更新' }}
                    </el-tag>
                    <span class="font-medium">{{ item.remark }}</span>
                    <span class="text-gray-500 text-sm">{{ formatDate(item.date) }}</span>
                  </div>
                  <!-- 右侧按钮 -->
                  <el-button
                    type="primary"
                    link
                    @click.stop="handleUseHistory(item.uuid)"
                  >
                    去更新
                  </el-button>
                </div>
              </template>

              <div class="space-y-4">
                <!-- 环境变量内容 -->
                <el-input
                  :model-value="item.env"
                  type="textarea"
                  :rows="4"
                  readonly
                />

                <!-- 操作按钮 -->
                <div class="flex items-center gap-2">
                  <el-button
                    type="primary"
                    @click.stop="handleEditRemark(item)"
                  >
                    修改备注
                  </el-button>
                  <el-button
                    type="danger"
                    @click.stop="handleDelete(item.uuid)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </el-collapse-item>

            <!-- 空状态 -->
            <div
              v-if="userStore.sortedHistoryEnvList.length === 0"
              class="text-center text-gray-500 py-8"
            >
              暂无历史记录
            </div>
          </el-collapse>
        </div>
      </div>
    </el-card>

    <!-- 添加编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改备注名称"
      width="400px"
    >
      <el-form>
        <el-form-item label="备注名称">
          <el-input
            v-model="editingRemark"
            placeholder="请输入备注名称"
            maxlength="50"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
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

:deep(.el-collapse) {
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;

  border: none;
}

:deep(.el-collapse-item__header) {
  font-size: inherit;
  font-weight: inherit;
}

:deep(.el-collapse-item__arrow) {
  margin-left: 8px;
}

:deep(.el-button--link) {
  height: auto;
  padding: 4px 8px;
}

:deep(.el-button--link):hover {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
