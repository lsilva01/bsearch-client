import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue' 

const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/mailthread', name: 'MailThread', component: () => import('@/pages/MailThread.vue') }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;