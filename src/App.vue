<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/layout/Navbar.vue'
import Sidebar from './components/layout/Sidebar.vue'

const route = useRoute()
const authStore = useAuthStore()

const showNavbar = computed(() => !route.meta.hideNavbar)
const showSidebar = computed(() => authStore.isAuthenticated && !route.meta.hideSidebar)
</script>

<template>
  <div class="app-container">
    <Navbar v-if="showNavbar" />
    <div class="main-layout">
      <Sidebar v-if="showSidebar" />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
}
</style>