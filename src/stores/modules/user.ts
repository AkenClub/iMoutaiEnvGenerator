import { store } from '@/stores'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  function refreshCookie() {
    return new Promise<void>((resolve) => {
      // TODO 待实现
      resolve()
    })
  }

  return { refreshCookie }
})

export function useUserStoreHook() {
  return useUserStore(store)
}
