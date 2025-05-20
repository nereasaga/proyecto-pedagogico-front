// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Panel from '../views/Panel.vue'
import Register from '../views/Register.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/panel', name: 'Panel', component: Panel },
  { path: '/register', name: 'Register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
