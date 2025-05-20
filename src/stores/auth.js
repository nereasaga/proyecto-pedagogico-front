import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const router = useRouter()

  const login = ({ email, password }) => {
    // Simulación de autenticación
    if (email === 'admin@admin.com' && password === 'admin123') {
      user.value = {
        name: 'Administrador',
        email: 'admin@admin.com',
        role: 'admin'
      }
      router.push('/panel')
    } else if (email !== '' && password !== '') {
      // Podrías simular otros usuarios aquí
      user.value = {
        name: 'Usuario normal',
        email,
        role: 'user'
      }
      router.push('/panel')
    } else {
      alert('Credenciales inválidas')
    }
  }

  const logout = () => {
    user.value = null
    router.push('/')
  }

  return { user, login, logout }
})
