<!-- <script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  
  if (!username.value || !password.value) {
    error.value = 'Por favor, introduzca su nombre de usuario y contraseña'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.login(username.value, password.value)
    
    // Redirect to dashboard or original requested page
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script> -->
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  
  if (!username.value || !password.value) {
    error.value = 'Por favor, introduzca su nombre de usuario y contraseña'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.login(username.value, password.value)
    
    // Redirect to dashboard or original requested page
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        
        <h1><img src="@/assets/logo.png" alt="Logo" class="navbar-logo-img" />Shift F5</h1>
        <p>Sistema de Gestión de Calendarios Laborales <br> Somos F5</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Usuario</label>
          <input 
            id="username"
            v-model="username"
            type="text"
            class="form-control"
            placeholder="Introduzca su nombre de usuario"
            autocomplete="username"
          >
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Introduzca su contraseña"
            autocomplete="current-password"
          >
        </div>
        
        <div v-if="error" class="login-error">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>
      
      <div class="login-demo-info">
        <h3>Usuarios de demostración</h3>
        <div class="demo-users">
          <div class="demo-user">
            <strong>Administrador:</strong> usuario: admin, contraseña: admin123
          </div>
          <div class="demo-user">
            <strong>Responsable de Área:</strong> usuario: manager, contraseña: manager123
          </div>
          <div class="demo-user">
            <strong>Empleado:</strong> usuario: employee, contraseña: employee123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-surface);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.login-header {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-lg);
  text-align: center;
}

.login-header h1 {
  margin-bottom: var(--spacing-xs);
}

.login-header p {
  margin-bottom: 0;
  opacity: 0.8;
}

.login-form {
  padding: var(--spacing-lg);
}

.login-error {
  background-color: rgba(211, 47, 47, 0.1);
  color: var(--color-error);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.login-demo-info {
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.login-demo-info h3 {
  font-size: 1rem;
  margin-bottom: var(--spacing-sm);
}

.demo-users {
  font-size: 0.875rem;
}

.demo-user {
  margin-bottom: var(--spacing-xs);
}
</style>