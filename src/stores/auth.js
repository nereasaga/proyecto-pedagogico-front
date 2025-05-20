import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await axios.post('http://localhost:5000/auth/login', {
          email,
          password,
        })

        this.token = res.data.access_token
        this.rol = res.data.rol

        // Guarda en localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('rol', this.rol)

        // Añade el token a los headers para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return true
      } catch (error) {
        console.error('Login fallido:', error.response?.data?.msg || error.message)
        return false
      }
    },

    logout() {
      this.token = null
      this.rol = null
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      delete axios.defaults.headers.common['Authorization']
    },

    isAuthenticated() {
      return !!this.token
    },
  },
})