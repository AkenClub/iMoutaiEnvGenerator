import dayjs from 'dayjs'
import { defineStore } from 'pinia'

// 用户生成的历史环境变量
export interface UserEnvHistory {
  date: string
  remark: string
  type: 'add' | 'update'
  uuid: string
  env: string
}

export const useUserStore = defineStore('user', () => {
  // 用户生成的历史环境变量
  const historyEnvList = ref<UserEnvHistory[]>([])

  // 添加计算属性：按时间倒序排序的历史记录
  const sortedHistoryEnvList = computed(() => {
    return [...historyEnvList.value].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  })

  // 保存用户生成的环境变量
  function saveEnv(env: UserEnvHistory) {
    historyEnvList.value.push(env)
  }

  // 刷新cookie
  function refreshCookie() {
    return new Promise<void>((resolve) => {
      // TODO 待实现
      resolve()
    })
  }

  // 根据 uuid 获取历史记录
  function getHistoryByUuid(uuid: string) {
    return historyEnvList.value.find(item => item.uuid === uuid)
  }

  // 更新历史记录
  function updateEnv(uuid: string, env: Partial<UserEnvHistory>) {
    const index = historyEnvList.value.findIndex(item => item.uuid === uuid)
    if (index !== -1) {
      historyEnvList.value[index] = {
        ...historyEnvList.value[index],
        ...env,
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 更新时间
      }
    }
  }

  // 清空历史记录
  function clearHistory() {
    historyEnvList.value = []
  }

  return {
    refreshCookie,
    saveEnv,
    historyEnvList,
    sortedHistoryEnvList,
    getHistoryByUuid,
    updateEnv,
    clearHistory,
  }
}, {
  persist: {
    storage: localStorage,
    pick: ['historyEnvList'],
  },
})
