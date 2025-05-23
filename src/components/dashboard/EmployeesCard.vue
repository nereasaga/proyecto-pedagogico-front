<template>
    <div class="dashboard-card">
      <h2>Empleados</h2>
  
      <div v-if="loading">Cargando…</div>
      <div v-else>
        <p class="stat-number">{{ total }}</p>
        <small>Total de empleados</small>
  
        <ul v-if="byCenter.length && isAdmin">
          <li v-for="c in byCenter" :key="c.id">
            {{ c.nombre }} – <strong>{{ c.count }}</strong>
          </li>
        </ul>
      </div>
      <div class="card-footer">
        <router-link to="/employees"><button class="btn">Ver Empleados</button></router-link>
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { api } from '../../services/api.js'
  import { useAuthStore } from '@/stores/auth'
  
  const loading  = ref(true)
  const total    = ref(0)
  const byCenter = ref([])
  
  const { userRole } = useAuthStore()
  const isAdmin = computed(() => userRole === 'admin')
  
  onMounted(fetchEmployees)
  
  async function fetchEmployees () {
    loading.value = true
    try {
      const empleados = await api.getEmpleados()
  
      total.value = empleados.length
  
      if (isAdmin.value) {
        // agrupar por centro
        const centros = await api.getCentrosTrabajo()
        byCenter.value = centros.map(c => ({
          id: c.id,
          nombre: c.nombre,
          count: empleados.filter(e => e.centro_id === c.id).length
        }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  </script>
  