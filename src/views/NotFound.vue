<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <div class="not-found-actions">
        <button @click="goBack" class="btn btn-outline">Volver</button>
        <button @click="goHome" class="btn btn-primary">Ir al inicio</button>
      </div>
    </div>
  </div>
</template>

<style>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: var(--spacing-xl);
}

.not-found h1 {
  font-size: 6rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.not-found h2 {
  font-size: 2rem;
  margin-bottom: var(--spacing-lg);
}

.not-found p {
  font-size: 1.125rem;
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>