import { setupStore } from '@/stores'
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import 'tailwindcss/tailwind.css'

import './style/main.scss'

const app = createApp(App)

app.use(router)
setupStore(app)

app.mount('#app')
