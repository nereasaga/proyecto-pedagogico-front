import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import MainLayout from '../layouts/MainLayout.vue'

// Views
import Login from '../views/auth/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import EmployeesList from '../views/employees/EmployeesList.vue'
import EmployeeDetails from '../views/employees/EmployeeDetails.vue'
import WorkCentersList from '../views/workCenters/WorkCentersList.vue'
import WorkCenterDetails from '../views/workCenters/WorkCenterDetails.vue'
import CalendarView from '../views/calendar/CalendarView.vue'
import UserProfile from '../views/profile/UserProfile.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      hideNavbar: true,
      hideSidebar: true,
      requiresAuth: false 
    }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'employees',
        name: 'EmployeesList',
        component: EmployeesList,
        meta: { requiredRole: ['admin', 'manager'] }
      },
      {
        path: 'employees/:id',
        name: 'EmployeeDetails',
        component: EmployeeDetails,
        props: true,
        meta: { requiredRole: ['admin', 'manager'] }
      },
      {
        path: 'work-centers',
        name: 'WorkCentersList',
        component: WorkCentersList,
        meta: { requiredRole: ['admin'] }
      },
      {
        path: 'work-centers/:id',
        name: 'WorkCenterDetails',
        component: WorkCenterDetails,
        props: true,
        meta: { requiredRole: ['admin'] }
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: CalendarView
      },
      {
        path: 'calendar/:employeeId',
        name: 'EmployeeCalendar',
        component: CalendarView,
        props: true
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta.requiredRole

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (requiredRole && !authStore.hasRequiredRole(requiredRole)) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router