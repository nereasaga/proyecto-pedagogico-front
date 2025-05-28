<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.userRole === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(authStore.userRole))

const menuItems = computed(() => {
  const items = [
    { 
      name: 'Dashboard', 
      path: '/',
    },
    { 
      name: 'Calendario', 
      path: '/calendar',
    }
  ]
  
  if (isManager.value) {
    items.push({ 
      name: 'Trabajadores', 
      path: '/employees',
    })
    
    items.push({ 
      name: 'Festivos', 
      path: '/holidays',
    })
  }
  
  if (isAdmin.value) {
    items.push({ 
      name: 'Centros de Trabajo', 
      path: '/work-centers',
    })
  }
  
  return items
})

const isActive = (path) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <ul class="sidebar-menu">
        <li v-for="item in menuItems" :key="item.path" 
            class="sidebar-menu-item" 
            :class="{ 'is-active': isActive(item.path) }">
          <router-link :to="item.path" class="sidebar-link">
            <span class="material-icons sidebar-icon">{{ item.icon }}</span>
            <span class="sidebar-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style>
.sidebar {
  width: 250px;
  background-color: white;
  box-shadow: var(--shadow-sm);
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  overflow-y: auto;
}

.sidebar-content {
  padding: var(--spacing-md) 0;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu-item {
  margin-bottom: var(--spacing-xs);
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.sidebar-link:hover {
  background-color: var(--color-surface);
}

.sidebar-menu-item.is-active .sidebar-link {
  background-color: rgba(25, 118, 210, 0.1);
  color: var(--color-primary);
  border-left: 3px solid var(--color-primary);
}

.sidebar-icon {
  margin-right: var(--spacing-sm);
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
  }
  
  .sidebar-menu {
    display: flex;
    overflow-x: auto;
  }
  
  .sidebar-menu-item {
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .sidebar-text {
    display: none;
  }
  
  .sidebar-icon {
    margin-right: 0;
  }
}
</style>