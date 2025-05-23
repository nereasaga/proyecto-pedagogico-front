// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  /* ---------------- estado reactivo ---------------- */
  const token = ref(localStorage.getItem('token'))
  const role  = ref(localStorage.getItem('rol'))
  const user  = ref(null) // { name, email, role }

  /* -------------- helpers internos ----------------- */
  const router = useRouter()

  // Añade o elimina el header Authorization global de axios
  const setAuthHeader = (jwt) => {
    if (jwt) axios.defaults.headers.common.Authorization = `Bearer ${jwt}`
    else      delete axios.defaults.headers.common.Authorization
  }

  // Si recargamos la página y hay token almacenado:
  if (token.value) setAuthHeader(token.value)

  /* ------------------- acciones -------------------- */
  // Login real contra tu API Flask
  const apiLogin = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      })

      // estado
      token.value = data.access_token
      role.value  = data.rol
      user.value  = { email, role: data.rol }

      // persistencia + headers
      localStorage.setItem('token', token.value)
      localStorage.setItem('rol', role.value)
      setAuthHeader(token.value)

      // navegación
      await router.push('/panel')
      return true
    } catch (err) {
      console.error('Login fallido:', err.response?.data?.msg || err.message)
      return false
    }
  }

  // Login simulado (para desarrollos offline o demos)
  const mockLogin = async (email, password) => {
    if (email === 'admin@admin.com' && password === 'admin123') {
      role.value = 'admin'
      user.value = { name: 'Administrador', email, role: 'admin' }
    } else if (email && password) {
      role.value = 'user'
      user.value = { name: 'Usuario normal', email, role: 'user' }
    } else {
      alert('Credenciales inválidas')
      return false
    }
  
    token.value = 'mock-token'
    localStorage.setItem('token', token.value)
    localStorage.setItem('rol', role.value)
    setAuthHeader(null)

    console.log('✅ mockLogin exitoso. Redirigiendo a /panel...')
await router.push('/panel')
  
    try {
      await router.push('/panel')
      return true
    } catch (err) {
      console.error('Error navegando a /panel:', err)
      return false
    }
  }

  // Cierre de sesión (sirve para ambos modos)
  const logout = () => {
    token.value = null
    role.value  = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    setAuthHeader(null)
    router.push('/')
  }

  const isAuthenticated = computed(() => !!token.value)

  /* ----------------- interface pública -------------- */
  return {
    // estado
    token,
    role,
    user,

    // acciones
    apiLogin,
    mockLogin,
    logout,

    // getters
    isAuthenticated,
  }
})
