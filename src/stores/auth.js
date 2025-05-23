// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'


// export const useAuthStore = defineStore('auth', () => {
//   const user = ref(null)
//   const token = ref(localStorage.getItem('auth_token') || null)
  
//   const isAuthenticated = computed(() => !!user.value)
//   const userRole = computed(() => user.value?.rol || null)
  
//   const hasRequiredRole = (requiredRoles) => {
//     if (!user.value) return false
//     if (user.value.rol === 'Administrador') return true
//     return Array.isArray(requiredRoles) 
//       ? requiredRoles.includes(user.value.rol)
//       : user.value.rol === requiredRoles
//   }

//   async function login(email, password) {
//     try {
//       const response = await fetch('/api/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, password })
//       })
      
//       if (!response.ok) {
//         throw new Error('Credenciales inválidas')
//       }
      
//       const data = await response.json()
//       user.value = data.user
//       token.value = data.token
//       localStorage.setItem('auth_token', data.token)
      
//       return data.user
//     } catch (error) {
//       throw new Error('Error al iniciar sesión')
//     }
//   }

//   function logout() {
//     user.value = null
//     token.value = null
//     localStorage.removeItem('auth_token')
//   }

//   async function checkAuth() {
//     const token = localStorage.getItem('auth_token')
//     if (!token) return false

//     try {
//       const response = await fetch('/api/me', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })
      
//       if (!response.ok) {
//         logout()
//         return false
//       }

//       const data = await response.json()
//       user.value = data
//       return true
//     } catch (error) {
//       logout()
//       return false
//     }
//   }

//   return {
//     user,
//     token,
//     isAuthenticated,
//     userRole,
//     hasRequiredRole,
//     login,
//     logout,
//     checkAuth
//   }
// })

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  
  // For demo purposes, we'll create some mock users
  const mockUsers = [
    { 
      id: 1, 
      username: 'admin', 
      password: 'admin123', 
      name: 'Admin User', 
      role: 'admin',
      workCenter: null // Admin can access all work centers
    },
    { 
      id: 2, 
      username: 'manager', 
      password: 'manager123', 
      name: 'Area Manager', 
      role: 'manager',
      workCenter: 1 // Barcelona work center
    },
    { 
      id: 3, 
      username: 'employee', 
      password: 'employee123', 
      name: 'John Employee', 
      role: 'employee',
      workCenter: 1, // Barcelona work center
      employeeId: 1 // Reference to employee record
    }
  ]

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  
  const userRole = computed(() => user.value ? user.value.role : null)
  
  const hasRequiredRole = (requiredRoles) => {
    if (!user.value) return false
    if (user.value.role === 'admin') return true // Admin has access to everything
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(user.value.role)
      : user.value.role === requiredRoles
  }

  // Actions
  function login(username, password) {
    // Find user in mock data (in real app, this would be an API call)
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    )
    
    if (foundUser) {
      // Create a copy without the password
      const { password: _, ...userWithoutPassword } = foundUser
      user.value = userWithoutPassword
      
      // Create mock token
      const mockToken = `mock-jwt-token-${Date.now()}`
      token.value = mockToken
      localStorage.setItem('auth_token', mockToken)
      
      return Promise.resolve(userWithoutPassword)
    }
    
    return Promise.reject(new Error('Invalid username or password'))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  // Simulate checking if token is valid on page refresh
  function checkAuth() {
    if (token.value) {
      // In a real app, you would validate the token with the server
      // For this demo, we'll just set a mock user based on the token
      user.value = mockUsers[0] // Set as admin for demo
      return true
    }
    return false
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    hasRequiredRole,
    login,
    logout,
    checkAuth
  }
})