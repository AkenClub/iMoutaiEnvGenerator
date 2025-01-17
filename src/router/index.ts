import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('@/views/generate/index.vue'),
    },
    {
      path: '/update',
      name: 'update',
      component: () => import('@/views/update/index.vue'),
    },
  ],
})

export default router
