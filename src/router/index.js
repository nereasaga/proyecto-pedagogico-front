import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Panel from '../views/Panel.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'

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
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/panel',   // a donde rediriges tras login
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // opcional, para proteger ruta
  }
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
  console.log('➡️ Navegando a:', to.path)
  console.log('🔐 Autenticado?', auth.isAuthenticated)
  console.log('👤 Rol actual:', auth.role)

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    console.warn('⛔ No autenticado, redirigiendo a /login')
    return next('/login')
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    console.warn('⛔ Rol no permitido, redirigiendo a /unauthorized')
    return next('/unauthorized')
  }

  console.log('✅ Acceso permitido')
  next()
})



export default router
