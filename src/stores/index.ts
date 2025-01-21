import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
// 使用持久化插件：https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/why.html
pinia.use(piniaPluginPersistedstate)

export function setupStore(app: App<Element>) {
  app.use(pinia)
}

export { pinia }
