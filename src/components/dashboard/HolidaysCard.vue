<template>
    <div class="dashboard-card">
      <h2>Festivos</h2>
  
      <div v-if="loading">Cargando…</div>
      <div v-else>
        <p class="stat-number">{{ total }}</p>
        <small>Total de festivos</small>
  
        <h3 v-if="upcoming.length">Próximos 30 días</h3>
        <ul>
          <li v-for="h in upcoming" :key="h.id">
            {{ formatDate(h.fecha) }} – {{ h.descripcion }}
          </li>
        </ul>
      </div>
      <div class="card-footer">
      <router-link to="/holidays"> <button class="btn">Ver Festivos</button> </router-link>
    </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { api } from '../../services/api.js'
  import { useAuthStore } from '@/stores/auth.js'
  
  const loading  = ref(true)
  const total    = ref(0)
  const upcoming = ref([])
  
  const { userRole, user } = useAuthStore()
  
  onMounted(fetchHolidays)
  
  async function fetchHolidays () {
    loading.value = true
    try {
      let festivos = await api.getFestivos()
  
      // si eres manager / employee, filtra por tu centro de trabajo
      if (userRole !== 'admin' && user?.workCenter) {
        festivos = festivos.filter(f => f.centro_id === user.workCenter)
      }
  
      total.value = festivos.length
  
      const today   = new Date()
      const future  = new Date()
      future.setDate(today.getDate() + 30)
  
      upcoming.value = festivos
        .filter(f => new Date(f.fecha) >= today && new Date(f.fecha) <= future)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(0, 5)
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }
  
  function formatDate (iso) {
    return new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'long' })
  }
  </script>
  