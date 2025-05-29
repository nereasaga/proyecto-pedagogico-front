<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendario Laboral</h1>
      <div class="calendar-filters">
        <!-- Work Center Filter (solo Admin) -->
        <div v-if="isAdmin" class="form-group">
          <label for="workCenterFilter">Centro de Trabajo</label>
          <select id="workCenterFilter" v-model="filters.workCenterId" class="form-control"
            @change="onWorkCenterChange">
            <option :value="null">Seleccionar centro</option>
            <option v-for="center in workCentersStore.workCenters" :key="center.id" :value="center.id">
              {{ center.nombre }}
            </option>
          </select>
        </div>

        <!-- Employee Filter -->
        <div class="form-group">
          <label for="employeeFilter">Empleado</label>
          <select id="employeeFilter" v-model="filters  .employeeId" class="form-control" :disabled="isEmployee"
            @change="onEmployeeChange">
            <option :value="null">Seleccionar empleado</option>
            <option v-for="emp in availableEmployees" :key="emp.usuario_id" :value="emp.usuario_id">
              {{ emp.nombre_completo }}
            </option>
          </select>
        </div>

        <!-- Mostrar/Ocultar toggles -->
        <div class="display-filters">
          <label class="form-check">
            <input type="checkbox" v-model="filters.showHolidays" @change="refreshCalendar" />
            Mostrar festivos
          </label>
          <label class="form-check">
            <input type="checkbox" v-model="filters.showVacations" @change="refreshCalendar" />
            Mostrar vacaciones
          </label>
          <label class="form-check">
            <input type="checkbox" v-model="filters.showWorkDays" @change="refreshCalendar" />
            Mostrar días laborables
          </label>
        </div>
      </div>

      <!-- Información del empleado seleccionado -->
      <div v-if="selectedEmployee" class="employee-info">
        <h2>Información del Empleado</h2>
        <ul>
          <li><strong>Nombre completo:</strong> {{ selectedEmployee.nombre_completo }}</li>
          <li><strong>Centro de trabajo:</strong> {{ selectedEmployee.centro_trabajo }}</li>
          <li><strong>Horas semanales asignadas:</strong> {{ selectedEmployee.jornada_semanal_horas }} h</li>
          <li><strong>Horas anuales asignadas:</strong> {{ annualHours }} h</li>
          <li><strong>Horas trabajadas (hasta {{ today }}):</strong> {{ workedHours }} h</li>
          <li><strong>Horas restantes:</strong> {{ remainingHours }} h</li>
          <li><strong>Días de vacaciones asignados:</strong> {{ selectedEmployee.dias_vacaciones_asignados }}</li>
        </ul>
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

import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

// Stores & route
const route = useRoute()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const workCentersStore = useWorkCentersStore()
const { getCalendario, getEmpleado } = api

// Refs & state
const calendarEl = ref(null)
let calendar = null

const filters = ref({
  workCenterId: null,
  employeeId: null,
  showHolidays: true,
  showVacations: true,
  showWorkDays: true
})

const festivos = ref([])
const vacaciones = ref([])
const workSchedules = ref([])
const annualHours = ref(0)

// Today for display
const today = new Date().toISOString().slice(0, 10)

// Roles & computed lists
const userRole = computed(() => authStore.userRole)
const isAdmin = computed(() => userRole.value === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')

const availableWorkCenters = computed(() => {
  if (isAdmin.value) return workCentersStore.workCenters
  if (isManager.value) {
    const wc = authStore.user?.workCenter
    return wc ? workCentersStore.workCenters.filter(c => c.id === wc) : []
  }
  return []
})

const availableEmployees = computed(() => {
  if (isEmployee.value) {
    const me = employeesStore.getEmployeeById(authStore.user.employeeId)
    return me ? [me] : []
  }
  let list = employeesStore.employees
  if (filters.value.workCenterId) {
    const centro = workCentersStore.getWorkCenterById(filters.value.workCenterId)
    if (centro) list = list.filter(e => e.centro_trabajo === centro.name)
  }
  return list
})

// Selected employee object
const selectedEmployee = computed(() =>
  availableEmployees.value.find(e => e.usuario_id === filters.value.employeeId) || null
)

// Compute worked and remaining hours
const workedHours = computed(() => {
  const year = new Date().getFullYear()
  let total = 0
  const fest = festivos.value.map(f => f.fecha)
  const vacs = vacaciones.value.filter(v => v.aprobada)
  for (let i = 0; i < 365; i++) {
    const d = new Date(year, 0, 1 + i)
    if (d > new Date()) break
    const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    if (fest.includes(ds)) continue
    if (vacs.some(v => ds >= v.fecha_inicio && ds <= v.fecha_fin)) continue
    const dow = d.getDay() === 0 ? 7 : d.getDay()
    const sched = workSchedules.value.find(h => h.dia_semana === dow)
    if (sched) {
      total += parseHours(sched.hora_salida) - parseHours(sched.hora_entrada)
    }
  }
  return Math.round(total * 100) / 100
})

const remainingHours = computed(() =>
  Math.max(0, Math.round((annualHours.value - workedHours.value) * 100) / 100)
)

/** Helpers */
function parseHours(hms) {
  const [h, m] = hms.split(':').map(Number)
  return h + m / 60
}
function pad(n) {
  return n < 10 ? '0' + n : '' + n
}
function dayNameToNumber(name) {
  switch (name.toLowerCase()) {
    case 'lunes': return 1
    case 'martes': return 2
    case 'miércoles':
    case 'miercoles': return 3
    case 'jueves': return 4
    case 'viernes': return 5
    case 'sábado':
    case 'sabado': return 6
    case 'domingo': return 7
  }
  return null
}

/** Load data */
async function loadAllData(empId) {
  if (!empId) {
    festivos.value = []
    vacaciones.value = []
    workSchedules.value = []
    annualHours.value = 0
    return
  }
  try {
    const data = await getCalendario(empId)
    festivos.value = data.festivos_aplicables || []
    vacaciones.value = data.vacaciones_registradas || []
    workSchedules.value = (data.horarios_semanales || []).map(h => ({
      dia_semana: dayNameToNumber(h.dia_semana),
      hora_entrada: h.hora_entrada,
      hora_salida: h.hora_salida
    }))
  } catch {
    festivos.value = []
    vacaciones.value = []
    workSchedules.value = []
  }
  try {
    const emp = await getEmpleado(empId)
    annualHours.value = emp.jornada_anual_horas || 0
  } catch {
    annualHours.value = 0
  }
}

/** Generate events */
function generateCalendarEvents() {
  const events = []
  // Festivos
  if (filters.value.showHolidays) {
    festivos.value.forEach(f => events.push({
      title: f.descripcion, start: f.fecha, allDay: true,
      classNames: ['holiday-event'], backgroundColor: '#ef5350', borderColor: '#ef5350',
      extendedProps: { type: 'holiday' }
    }))
  }
  // Vacaciones
  if (filters.value.showVacations) {
    vacaciones.value.filter(v => v.aprobada).forEach(v => {
      const end = new Date(v.fecha_fin)
      end.setDate(end.getDate() + 1)
      events.push({
        title: 'Vacaciones', start: v.fecha_inicio, end: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
        allDay: true, classNames: ['vacation-event'], backgroundColor: '#f1af26', borderColor: '#f1af26',
        extendedProps: { type: 'vacation', days: v.dias_solicitados }
      })
    })
  }
  // Días laborables
  if (filters.value.showWorkDays) {
    const year = new Date().getFullYear()
    let acc = 0
    const fest = festivos.value.map(f => f.fecha)
    const vacs = vacaciones.value.filter(v => v.aprobada)
    for (let i = 0; i < 365; i++) {
      const d = new Date(year, 0, 1 + i)
      if (d.getFullYear() !== year) break
      const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      if (fest.includes(ds)) continue
      if (vacs.some(v => ds >= v.fecha_inicio && ds <= v.fecha_fin)) continue
      const dow = d.getDay() === 0 ? 7 : d.getDay()
      const sched = workSchedules.value.find(h => h.dia_semana === dow)
      if (!sched) continue
      const hrs = parseHours(sched.hora_salida) - parseHours(sched.hora_entrada)
      if (acc + hrs > annualHours.value) break
      events.push({
        title: `${sched.hora_entrada} - ${sched.hora_salida}`,
        start: ds, allDay: true,
        classNames: ['workday-event'], backgroundColor: '#4caf50', borderColor: '#4caf50',
        extendedProps: { type: 'workday', hours: hrs }
      })
      acc += hrs
    }
  }
  return events
}

/** Calendar init & refresh */
function initializeCalendar() {
  if (!calendarEl.value) return
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth' },
    locale: 'es', locales: [esLocale],
    firstDay: 1, height: 'auto',
    events: generateCalendarEvents()
  })
  calendar.render()
}
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
watch(() => [filters.value.showHolidays, filters.value.showVacations, filters.value.showWorkDays],
  () => refreshCalendar())

// Placeholders
function onWorkCenterChange() { }
function onEmployeeChange() { }

// Mounted
onMounted(async () => {
  await employeesStore.fetchEmployees()
  const eid = route.params.employeeId
  if (isAdmin.value && eid == null) {
    const firstEmp = availableEmployees.value[0]
    filters.value.employeeId = firstEmp ? firstEmp.usuario_id : null
  } else {
    filters.value.employeeId = eid != null
      ? Number(eid)
      : isEmployee.value
        ? authStore.user.employeeId
        : null
  }
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

.employee-info {
  margin-top: 1rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.employee-info h2 {
  margin-bottom: 0.5rem;
}

.employee-info ul {
  list-style: none;
  padding: 0;
}

.employee-info li {
  margin: 0.25rem 0;
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
