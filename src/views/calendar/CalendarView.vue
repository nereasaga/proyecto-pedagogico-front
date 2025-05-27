<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendario Laboral</h1>
      <div class="calendar-filters">
        <!-- Work Center Filter (solo Admin) -->
        <div v-if="isAdmin" class="form-group">
          <label for="workCenterFilter" class="form-label">Centro de Trabajo</label>
          <select id="workCenterFilter" v-model="filters.workCenterId" class="form-control"
            @change="onWorkCenterChange">
            <option :value="null">Todos los centros</option>
            <option v-for="center in availableWorkCenters" :key="center.id" :value="center.id">
              {{ center.name }}
            </option>
          </select>
        </div>

        <!-- Employee Filter -->
        <div class="form-group">
          <label for="employeeFilter" class="form-label">Empleado</label>
          <select id="employeeFilter" v-model="filters.employeeId" class="form-control" :disabled="isEmployee"
            @change="onEmployeeChange">
            <option :value="null">Todos los empleados</option>
            <option v-for="emp in availableEmployees" :key="emp.usuario_id" :value="emp.usuario_id">
              {{ emp.nombre_completo }}
            </option>
          </select>
        </div>

        <!-- Mostrar/Ocultar toggles -->
        <div class="display-filters">
          <label class="form-check">
            <input type="checkbox" v-model="filters.showHolidays" @change="refreshCalendar" /> Mostrar festivos
          </label>
          <label class="form-check">
            <input type="checkbox" v-model="filters.showVacations" @change="refreshCalendar" /> Mostrar vacaciones
          </label>
          <label class="form-check">
            <input type="checkbox" v-model="filters.showWorkDays" @change="refreshCalendar" /> Mostrar días laborables
          </label>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <div ref="calendarEl" class="calendar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEmployeesStore } from '@/stores/employees'
import { useWorkCentersStore } from '@/stores/workCenters'
import { api } from '@/services/api'

// FullCalendar + plugins + locale
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

// ——— Stores & Route ———
const route = useRoute()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const workCentersStore = useWorkCentersStore()
const { getCalendario, getHorariosEmpleado, getEmpleado } = api

// ——— Calendar ref ———
const calendarEl = ref(null)
let calendar = null

// ——— Filter state ———
const filters = ref({
  workCenterId: null,
  employeeId: null,
  showHolidays: true,
  showVacations: true,
  showWorkDays: true
})

// ——— User roles ———
const userRole = computed(() => authStore.userRole)
const isAdmin = computed(() => userRole.value === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')

// ——— Available work centers ———
const availableWorkCenters = computed(() => {
  if (isAdmin.value) return workCentersStore.workCenters
  if (isManager.value) {
    const wc = authStore.user?.workCenter
    return wc
      ? workCentersStore.workCenters.filter(c => c.id === wc)
      : []
  }
  return []
})

// ——— Available employees ———
const availableEmployees = computed(() => {
  if (isEmployee.value) {
    const me = employeesStore.getEmployeeById(authStore.user.employeeId)
    return me ? [me] : []
  }
  let list = employeesStore.employees
  if (filters.value.workCenterId) {
    const centro = workCentersStore.getWorkCenterById(filters.value.workCenterId)
    if (centro) {
      list = list.filter(e => e.centro_trabajo === centro.name)
    }
  }
  return list
})

// ——— Data from backend ———
const festivos = ref([])
const vacaciones = ref([])
const workSchedules = ref([])
const annualHours = ref(0)  // jornada_anual_horas

/** Load all calendar data */
async function loadAllData(empId) {
  if (!empId) {
    festivos.value = []; vacaciones.value = []; workSchedules.value = []; annualHours.value = 0
    return
  }
  // Festivos & vacaciones
  try {
    const data = await getCalendario(empId)
    festivos.value = data.festivos_aplicables || []
    vacaciones.value = data.vacaciones_registradas || []
  } catch {
    festivos.value = []; vacaciones.value = []
  }
  // Horarios
  try {
    workSchedules.value = await getHorariosEmpleado(empId)
  } catch {
    workSchedules.value = []
  }
  // Jornada anual
  try {
    const emp = await getEmpleado(empId)
    annualHours.value = emp.jornada_anual_horas || 0
  } catch {
    annualHours.value = 0
  }
}

/** Convert "HH:MM:SS" to decimal hours */
function parseHours(hms) {
  const [h, m] = hms.split(':').map(Number)
  return h + m / 60
}

/** Generate FullCalendar events */
function generateCalendarEvents() {
  const events = []

  // Festivos
  if (filters.value.showHolidays) {
    festivos.value.forEach(f => {
      events.push({
        title: f.descripcion,
        start: f.fecha,
        allDay: true,
        classNames: ['holiday-event'],
        backgroundColor: '#ef5350',
        borderColor: '#ef5350',
        extendedProps: { type: 'holiday' }
      })
    })
  }

  // Vacaciones aprobadas
  if (filters.value.showVacations) {
    vacaciones.value
      .filter(v => v.aprobada)
      .forEach(v => {
        const end = new Date(v.fecha_fin)
        end.setDate(end.getDate() + 1)
        events.push({
          title: 'Vacaciones',
          start: v.fecha_inicio,
          end: end.toISOString().slice(0, 10),
          allDay: true,
          classNames: ['vacation-event'],
          backgroundColor: '#f1af26',
          borderColor: '#f1af26',
          extendedProps: { type: 'vacation', days: v.dias_solicitados }
        })
      })
  }

  // Días laborables (respetando anualHours)
  if (filters.value.showWorkDays) {
    const now = new Date(), year = now.getFullYear()
    let date = new Date(year, 0, 1), accumulated = 0
    while (date.getFullYear() === year && accumulated < annualHours.value) {
      const ds = date.toISOString().slice(0, 10)
      const dow = date.getDay()
      const sched = workSchedules.value.find(h => h.dia_semana + 1 === dow)

      const isHoliday = festivos.value.some(f => f.fecha === ds)
      const isVacation = vacaciones.value.some(v => {
        const start = new Date(v.fecha_inicio), end = new Date(v.fecha_fin)
        return v.aprobada && start <= date && date <= end
      })

      if (!isHoliday && !isVacation && sched) {
        const hrs = parseHours(sched.hora_salida) - parseHours(sched.hora_entrada)
        if (accumulated + hrs <= annualHours.value) {
          events.push({
            title: `${sched.hora_entrada} - ${sched.hora_salida}`,
            start: ds,
            allDay: true,
            classNames: ['workday-event'],
            backgroundColor: '#4caf50',
            borderColor: '#4caf50',
            extendedProps: { type: 'workday', hours: hrs }
          })
          accumulated += hrs
        } else break
      }
      date.setDate(date.getDate() + 1)
    }
  }

  return events
}

/** Initialize FullCalendar */
function initializeCalendar() {
  if (!calendarEl.value) return
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth' },
    locale: 'es',
    locales: [esLocale],
    firstDay: 1,
    height: 'auto',
    events: generateCalendarEvents()
  })
  calendar.render()
}

/** Refresh events only */
function refreshCalendar() {
  if (!calendar) return
  calendar.removeAllEvents()
  calendar.addEventSource(generateCalendarEvents())
}

// Watchers
watch(() => filters.value.employeeId, async id => {
  await loadAllData(id)
  refreshCalendar()
})
watch(() => filters.value.workCenterId, () => {
  filters.value.employeeId = null
  refreshCalendar()
})
watch(() => [filters.value.showHolidays, filters.value.showVacations, filters.value.showWorkDays], () => {
  refreshCalendar()
})

// Handlers
function onWorkCenterChange() { /* triggers watcher */ }
function onEmployeeChange() { /* triggers watcher */ }

// Lifecycle
onMounted(async () => {
  await employeesStore.fetchEmployees()
  const eid = route.params.employeeId
  filters.value.employeeId = eid != null
    ? Number(eid)
    : isEmployee.value
      ? authStore.user.employeeId
      : null
  await loadAllData(filters.value.employeeId)
  initializeCalendar()
})
</script>

<style scoped>
.calendar-view {
  width: 100%;
}

.calendar-header {
  margin-bottom: var(--spacing-lg);
}

.calendar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.display-filters {
  display: flex;
  gap: var(--spacing-md);
}

.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.calendar-container {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.calendar {
  min-height: 500px;
}

.holiday-event,
.vacation-event,
.workday-event {
  font-weight: bold;
}

@media(max-width:768px) {
  .calendar-filters {
    flex-direction: column;
  }

  .display-filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
