<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'


const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole)
const userName = computed(() => authStore.user?.name || '')
const isAdmin = computed(() => userRole.value === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')

// Datos recibidos desde Flask
const holidays = ref([])  // festivos_aplicables
const vacations = ref([]) // vacaciones_registradas

// Estadísticas
const holidayStats = ref({
  upcoming: [],
  total: 0
})
const vacationStats = ref({
  upcoming: [],
  total: 0
})

const getUpcomingDays = () => {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 30)
  
  return {
    today: today.toISOString().split('T')[0],
    future: futureDate.toISOString().split('T')[0]
  }
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

const fetchCalendarData = async () => {
  try {
    // Asumo que authStore.user.id contiene el usuario actual
    const res = await fetch(`/api/calendario/${authStore.user.id}`)
    if (!res.ok) throw new Error('Error al cargar calendario')
    const data = await res.json()

    holidays.value = data.festivos_aplicables
    vacations.value = data.vacaciones_registradas

    // Estadísticas de festivos próximos
    const { today, future } = getUpcomingDays()
    holidayStats.value.total = holidays.value.length
    holidayStats.value.upcoming = holidays.value
      .filter(h => h.fecha >= today && h.fecha <= future)
      .sort((a,b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 5)

    // Estadísticas vacaciones próximas aprobadas
    vacationStats.value.total = vacations.value.length
    vacationStats.value.upcoming = vacations.value
      .filter(v => v.aprobada && v.fecha_inicio >= today && v.fecha_inicio <= future)
      .sort((a,b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
      .slice(0, 5)

  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchCalendarData()
})

</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Bienvenido, {{ userName }}</h1>
      <p>Panel de control del sistema de gestión de calendarios laborales</p>
    </div>
    
    <div class="dashboard-content">
      <!-- Admin and Manager Dashboard -->
      <div v-if="isAdmin || isManager" class="card-grid">
        <!-- Employee Stats -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Empleados</h2>
          </div>
          <div class="card-body">
            <div class="stat-number">{{ employeeStats.count }}</div>
            <p>Total de empleados</p>
            
            <div v-if="isAdmin && employeeStats.byWorkCenter.length > 0" class="stat-breakdown">
              <div v-for="center in employeeStats.byWorkCenter" :key="center.workCenterId" class="stat-item">
                <span>{{ center.workCenterName }}:</span> 
                <strong>{{ center.count }}</strong>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <router-link to="/employees" class="btn btn-outline btn-sm">
              Ver Empleados
            </router-link>
          </div>
        </div>
        
        <!-- Holidays Stats -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Festivos</h2>
          </div>
          <div class="card-body">
            <div class="stat-number">{{ holidayStats.total }}</div>
            <p>Total de festivos registrados</p>
            
            <div v-if="holidayStats.upcoming.length > 0" class="upcoming-list">
              <h3>Próximos festivos</h3>
              <ul>
                <li v-for="holiday in holidayStats.upcoming" :key="holiday.id">
                  <span class="upcoming-date">{{ formatDate(holiday.date) }}</span>
                  <span class="upcoming-name">{{ holiday.name }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="card-footer">
            <router-link to="/holidays" class="btn btn-outline btn-sm">
              Ver Festivos
            </router-link>
          </div>
        </div>
        
        <!-- Calendar Quick Access -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Calendarios</h2>
          </div>
          <div class="card-body">
            <p>Accede rápidamente a la gestión de calendarios laborales.</p>
          </div>
          <div class="card-footer">
            <router-link to="/calendar" class="btn btn-primary btn-sm">
              Ver Calendario
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Employee Dashboard -->
      <div v-if="isEmployee" class="card-grid">
        <!-- My Calendar -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Mi Calendario</h2>
          </div>
          <div class="card-body">
            <p>Accede a tu calendario laboral personal.</p>
          </div>
          <div class="card-footer">
            <router-link :to="`/calendar/${employeeId}`" class="btn btn-primary btn-sm">
              Ver Mi Calendario
            </router-link>
          </div>
        </div>
        
        <!-- Holidays -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Próximos Festivos</h2>
          </div>
          <div class="card-body">
            <div v-if="holidayStats.upcoming.length > 0" class="upcoming-list">
              <ul>
                <li v-for="holiday in holidayStats.upcoming" :key="holiday.id">
                  <span class="upcoming-date">{{ formatDate(holiday.date) }}</span>
                  <span class="upcoming-name">{{ holiday.name }}</span>
                </li>
              </ul>
            </div>
            <div v-else>
              <p>No hay festivos próximos en los siguientes 30 días.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.dashboard {
  width: 100%;
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.dashboard-card {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-breakdown {
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.upcoming-list {
  margin-top: var(--spacing-md);
}

.upcoming-list h3 {
  font-size: 1rem;
  margin-bottom: var(--spacing-sm);
}

.upcoming-list ul {
  list-style: none;
  padding: 0;
}

.upcoming-list li {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.upcoming-list li:last-child {
  border-bottom: none;
}

.upcoming-date {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.upcoming-name {
  font-weight: 600;
}

.card-footer {
  margin-top: auto;
  padding-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>