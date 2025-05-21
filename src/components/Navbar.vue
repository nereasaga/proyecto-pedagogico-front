<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo">MiLogo</div>

      <!-- Si no estamos en /panel, muestra el enlace -->
      <div v-if="route.name !== 'Panel'" class="panel-link">
        <router-link to="/panel">Volver al panel</router-link>
      </div>

      <div class="nav-actions" :class="{ open: isMenuOpen }">
        <template v-if="user">
          <span class="user-email">{{ user.email }}</span>
          <button class="btn" @click="logout">Salir</button>
          <button
            v-if="user.role === 'Administrador'"
            class="btn-outline"
            @click="goToRegister"
          >
            Registrar
          </button>
        </template>
        <template v-else>
          <button class="btn" @click="goToLogin">Entrar</button>
        </template>
      </div>

      <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen">
        <span class="burger"></span>
        <span class="burger"></span>
        <span class="burger"></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { computed, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const user = computed(() => auth.user)
const isMenuOpen = ref(false)

const logout = () => {
  auth.logout()
  isMenuOpen.value = false
}

const goToLogin = () => {
  router.push('/')
  isMenuOpen.value = false
}

const goToRegister = () => {
  router.push('/register')
  isMenuOpen.value = false
}
</script>

<style scoped>
.navbar {
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}
.navbar-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: .5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

/* Enlace “Volver al panel” */
.panel-link {
  margin-right: auto;
}
.panel-link a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}
.panel-link a:hover {
  text-decoration: underline;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: max-height .3s ease;
}
.btn, .btn-outline {
  padding: .5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: .9rem;
}
.btn {
  background: var(--primary);
  color: #fff;
  border: none;
}
.btn:hover { opacity: .9; }
.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btn-outline:hover {
  background: var(--primary);
  color: #fff;
}
.user-email {
  font-size: .9rem;
  color: #555;
}
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
}
.burger {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
}

/* móvil */
@media (max-width:768px){
  .nav-actions {
    position:absolute;
    top:100%;
    right:0;
    flex-direction: column;
    background:#fff;
    width:200px;
    max-height:0;
    overflow:hidden;
    border:1px solid #e0e0e0;
    box-shadow:0 4px 8px rgba(0,0,0,0.1);
  }
  .nav-actions.open { max-height:300px; }
  .menu-toggle { display:flex; }
}
</style>
