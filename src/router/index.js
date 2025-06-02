import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      alias: '/home',
      name: 'home',
      title: 'home',
      component: HomeView
    },
    {
      path: '/ssq',
      name: 'ssq',
      title: '双色球',
      component: () => import('../views/ShuangSeQiu.vue')
    },
    {
      path: '/cjdlt',
      name: 'cjdlt',
      title: '超级大乐透',
      component: () => import('../views/ChaoJiDaLeTou.vue')
    },
    {
      path: '/tongji',
      name: 'tongji',
      title: '统计',
      component: () => import('../views/BallStatistics.vue')
    }
  ]
})

export default router
