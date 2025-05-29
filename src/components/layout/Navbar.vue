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
        <img src="@/assets/logo.png" alt="Logo" class="navbar-logo-img" />
        <span>Shift F5</span>
      </router-link>
    </div>
    
    <div class="navbar-menu">
      <div v-if="isLoggedIn" class="navbar-user">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
        <div class="user-dropdown">
  <button class="btn-icon">
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="24" height="24" 
         viewBox="0 0 24 24" 
         fill="none" stroke="currentColor" 
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
         class="icon-user">
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
      <circle cx="12" cy="7" r="4" />
    </svg>
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
  position: relative; 
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.navbar-brand {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.navbar-logo {
  color: white;
  text-decoration: none;
}

.navbar-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(91%) sepia(6%) saturate(2595%) hue-rotate(193deg) brightness(107%) contrast(91%);
}

.navbar-menu {
  margin-left: auto; 
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
  padding: 8px 12px; 
  min-width: 60px;
  min-height: 60px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: white;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  width: 200px;
  z-index: 100;
  display: none; 
  flex-direction: column;
}

.user-dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-fast);
  cursor: pointer;
  text-align: center;
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
  .dropdown-item {
   font-size: 1rem;
  }

</style>