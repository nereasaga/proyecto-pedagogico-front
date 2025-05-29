<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || '')
const userRole = computed(() => {
  if (!authStore.user) return ''
  
  switch (authStore.user.role) {
    case 'admin':
      return 'Administrador'
    case 'manager':
      return 'Responsable de Área'
    case 'employee':
      return 'Empleado'
    default:
      return ''
  }
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-logo">
        <span>Shift F5</span>
      </router-link>
    </div>
    
    <div class="navbar-menu">
      <div v-if="isLoggedIn" class="navbar-user">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
        <div class="user-dropdown">
          <button class="btn-icon">
            <span class="material-icons">O</span>
          </button>
          <div class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">Perfil</router-link>
            <button @click="logout" class="dropdown-item">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style>
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-logo {
  display: flex;
  align-items: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  align-items: center;
}

.navbar-user {
  display: flex;
  align-items: center;
  position: relative;
}

.user-name {
  font-weight: 500;
  margin-right: var(--spacing-xs);
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-right: var(--spacing-sm);
}

.user-dropdown {
  position: relative;
}

.btn-icon {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: white;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  width: 200px;
  z-index: 100;
  display: none;
}

.user-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-fast);
  cursor: pointer;
  text-align: left;
  border: none;
  width: 100%;
  background: transparent;
}

.dropdown-item:hover {
  background-color: var(--color-surface);
}

@media (max-width: 768px) {
  .user-name, .user-role {
    display: none;
  }
}
.navbar {
    justify-content: flex-end;
    gap: 9.5rem;
  }
</style>