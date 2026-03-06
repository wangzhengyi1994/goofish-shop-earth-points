import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Earth',
    component: () => import('@/views/earth/index.vue')
  },
  {
    path: '/zhejiang',
    name: 'Zhejiang',
    component: () => import('@/views/gdMap/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
