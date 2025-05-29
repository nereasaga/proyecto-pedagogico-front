<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showSidebar = ref(true) 

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 🔁 Forzar sidebar visible en pantallas grandes
const handleResize = () => {
  if (window.innerWidth > 768) {
    showSidebar.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // asegúrate de ajustar estado al montar
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const isAdmin = computed(() => authStore.userRole === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(authStore.userRole))

const menuItems = computed(() => {
  const items = [
    { name: 'Dashboard', path: '/' },
    { name: 'Calendario', path: '/calendar' }
  ]
  if (isManager.value) {
    items.push({ name: 'Trabajadores', path: '/employees' })
    items.push({ name: 'Festivos', path: '/holidays' })
  }
  if (isAdmin.value) {
    items.push({ name: 'Centros de Trabajo', path: '/work-centers' })
  }
  return items
})

const isActive = (path) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>


<template>
<button class="hamburger-btn" @click="toggleSidebar">
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>

  <aside class="sidebar" v-show="showSidebar">
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

.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 1001;
  position: absolute;
  top: 16px;
  left: 16px;
}

.hamburger-line {
  height: 3px;
  width: 100%;
  background-color: white;
  border-radius: 2px;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .hamburger-btn {
    display: flex;
    margin-top: 0.5rem;
  }

  .sidebar {
    position: absolute;
    width: 250px;
    top: 60px;
    left: 0;
    background-color: white;
    z-index: 1000;
    box-shadow: var(--shadow-sm);
  }
}


</style>