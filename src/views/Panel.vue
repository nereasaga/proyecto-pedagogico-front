<template>
  <div class="panel">
    <h2>Panel del Usuario</h2>
    <p><strong>Nombre:</strong> {{ user?.name }}</p>
    <p><strong>Email:</strong> {{ user?.email }}</p>

    <div class="panel-actions">
      <!-- Este botón sólo para administradores -->
      <button
        v-if="user.role === 'admin' || user.role === 'Administrador'"
        @click="goToRegister"
        class="btn-sm-outline"
      >
        Registrar usuario
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

onMounted(() => {
  if (!user) {
    router.push('/')
  }
})

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.panel {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
}
.panel-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}
.btn-sm-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
