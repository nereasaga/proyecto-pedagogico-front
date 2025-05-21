import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Panel from '../views/Panel.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'areamanager'] }
  },
  {
    path: '/worker',
    component: () => import('@/views/WorkerDash.vue'),
    meta: { requiresAuth: true, roles: ['worker'] }
  },
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/panel', name: 'Panel', component: Panel },
  { path: '/register', name: 'Register', component: Register }
//   {
//     path: '/login',
//     component: () => import('@/views/Login.vue')
//   },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Autentication guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated()) {
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    next('/unauthorized') 
  } else {
    next()
  }
})




export default router
