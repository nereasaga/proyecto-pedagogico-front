<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendario Laboral</h1>
      <div class="calendar-filters">
        <!-- Centro de Trabajo (solo Admin) -->
        <div v-if="isAdmin" class="form-group">
          <label for="workCenterFilter" class="form-label">Centro de Trabajo</label>
          <select
            id="workCenterFilter"
            v-model="filters.workCenterId"
            class="form-control"
            @change="onWorkCenterChange"
          >
            <option :value="null">Todos los centros</option>
            <option
              v-for="c in availableWorkCenters"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Empleado -->
        <div class="form-group">
          <label for="employeeFilter" class="form-label">Empleado</label>
          <select
            id="employeeFilter"
            v-model="filters.employeeId"
            class="form-control"
            @change="onEmployeeChange"
            :disabled="isEmployee"
          >
            <option :value="null">Todos los empleados</option>
            <option
              v-for="e in availableEmployees"
              :key="e.usuario_id"
              :value="e.usuario_id"
            >
              {{ e.nombre_completo }}
            </option>
          </select>
        </div>

        <!-- Mostrar / Ocultar -->
        <div class="display-filters">
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showHolidays"
              @change="refreshCalendar"
            />
            Mostrar festivos
          </label>
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showVacations"
              @change="refreshCalendar"
            />
            Mostrar vacaciones
          </label>
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showWorkDays"
              @change="refreshCalendar"
            />
            Mostrar días laborables
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
import { useAuthStore } from '../../stores/auth'
import { useEmployeesStore } from '../../stores/employees'
import { useWorkCentersStore } from '../../stores/workCenters'
import { api } from '@/services/api'

// FullCalendar core + plugins + locale
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'

// ——— Stores & Route ———
const route = useRoute()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const workCentersStore = useWorkCentersStore()

// ——— Calendar ref ———
const calendarEl = ref(null)
let calendar = null

// ——— Filtros reactivos ———
const filters = ref({
  workCenterId: null,
  employeeId: null,
  showHolidays: true,
  showVacations: true,
  showWorkDays: true
})

// ——— Roles ———
const userRole   = computed(() => authStore.userRole)
const isAdmin    = computed(() => userRole.value === 'admin')
const isManager  = computed(() => ['admin','manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')

// ——— Centros disponibles ———
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

// ——— Empleados disponibles (filtrados) ———
const availableEmployees = computed(() => {
  if (isEmployee.value) {
    const me = employeesStore.getEmployeeById(authStore.user.employeeId)
    return me ? [me] : []
  }
  let list = employeesStore.employees
  if (filters.value.workCenterId) {
    const centro = workCentersStore
      .getWorkCenterById(filters.value.workCenterId)
    if (centro) {
      list = list.filter(e => e.centro_trabajo === centro.name)
    }
  }
  return list
})

// ——— Datos del backend ———
const festivos  = ref([])
const horarios  = ref([])
const vacaciones = ref([])

/** Trae festivos, horarios y vacaciones para un empleado */
async function loadCalendarData(empId) {
  try {
    const data = await api.getCalendario(empId)
    festivos.value   = data.festivos_aplicables   || []
    horarios.value   = data.horarios_semanales   || []
    vacaciones.value = data.vacaciones_registradas || []
  } catch (e) {
    console.error('Error al cargar calendario:', e)
    festivos.value = []
    horarios.value = []
    vacaciones.value = []
  }
}

/** Mapea nombre de día a número JS (0=Domingo) */
function mapDayNameToNum(name) {
  return {
    Domingo:0, Lunes:1, Martes:2,
    'Miércoles':3, Jueves:4, Viernes:5, Sábado:6
  }[name] ?? null
}

// Conjuntos para exclusiones
const holidayDates = computed(() =>
  new Set(festivos.value.map(f => f.fecha))
)
const vacationDates = computed(() => {
  const s = new Set()
  vacaciones.value
    .filter(v => v.aprobada)
    .forEach(v => {
      let d = new Date(v.fecha_inicio)
      const end = new Date(v.fecha_fin)
      while (d <= end) {
        s.add(d.toISOString().slice(0,10))
        d.setDate(d.getDate()+1)
      }
    })
  return s
})
const workDaysNums = computed(() =>
  horarios.value
    .map(h => mapDayNameToNum(h.dia_semana))
    .filter(n => n !== null)
)

/** Genera la lista de eventos para FullCalendar */
function generateEvents() {
  const evs = []

  // Festivos
  if (filters.value.showHolidays) {
    festivos.value.forEach(f => {
      evs.push({
        title: f.descripcion,
        start: f.fecha,
        allDay: true,
        classNames: ['holiday-event'],
        backgroundColor: '#ef5350',
        borderColor:    '#ef5350',
        extendedProps:  { type: 'holiday' }
      })
    })
  }

  // Vacaciones
  if (filters.value.showVacations) {
    vacaciones.value
      .filter(v => v.aprobada)
      .forEach(v => {
        const end = new Date(v.fecha_fin)
        end.setDate(end.getDate()+1)
        evs.push({
          title: 'Vacaciones',
          start: v.fecha_inicio,
          end:   end.toISOString().slice(0,10),
          allDay: true,
          classNames: ['vacation-event'],
          backgroundColor: '#ff9800',
          borderColor:    '#ff9800',
          extendedProps:  { type: 'vacation', days: v.dias_solicitados }
        })
      })
  }

  // Días laborables
  if (filters.value.showWorkDays) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month+1, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const ds = date.toISOString().slice(0,10)
      const dow = date.getDay()

      if (
        workDaysNums.value.includes(dow) &&
        !holidayDates.value.has(ds) &&
        !vacationDates.value.has(ds)
      ) {
        const h = horarios.value.find(
          h => mapDayNameToNum(h.dia_semana) === dow
        )
        evs.push({
          title: `${h.hora_entrada} - ${h.hora_salida}`,
          start: ds,
          allDay: true,
          classNames: ['workday-event'],
          backgroundColor: '#4caf50',
          borderColor:    '#4caf50',
          extendedProps:  { type: 'workday' }
        })
      }
    }
  }

  return evs
}

/** Inicializa FullCalendar */
function initCalendar() {
  if (!calendarEl.value) return
  calendar = new Calendar(calendarEl.value, {
    plugins:      [ dayGridPlugin, interactionPlugin ],
    initialView:  'dayGridMonth',
    headerToolbar:{ left:'prev,next today', center:'title', right:'dayGridMonth' },
    locale:       'es',
    locales:      [ esLocale ],
    firstDay:     1,
    height:       'auto',
    events:       generateEvents()
  })
  calendar.render()
}

/** Refresca solo los eventos */
function refreshCalendar() {
  if (!calendar) return
  calendar.removeAllEvents()
  calendar.addEventSource(generateEvents())
}

/** Inicializa filtros desde la ruta o rol */
function initializeFromRoute() {
  const { employeeId } = route.params
  if (employeeId) {
    filters.value.employeeId = +employeeId
  } else if (isEmployee.value) {
    filters.value.employeeId = authStore.user.employeeId
  }
  // Mapear centro_trabajo → workCenterId
  if (filters.value.employeeId != null) {
    const emp = employeesStore.getEmployeeById(filters.value.employeeId)
    if (emp) {
      const c = workCentersStore.workCenters
        .find(x => x.name === emp.centro_trabajo)
      filters.value.workCenterId = c?.id ?? null
    }
  }
}

// — Watchers —
watch(() => filters.value.employeeId, async (id) => {
  await loadCalendarData(id)
  refreshCalendar()
})
watch(() => filters.value.workCenterId, () => {
  filters.value.employeeId = null
  refreshCalendar()
})

// — Handlers UI —
function onWorkCenterChange() { /* ya limpia employee */ }
function onEmployeeChange()   { /* dispara el watcher */ }

// — Lifecycle —
onMounted(async () => {
  // 1) Cargar empleados para el selector
  await employeesStore.fetchEmployees()
  // 2) Inicializar filtros
  initializeFromRoute()
  // 3) Cargar datos del calendario
  if (filters.value.employeeId != null) {
    await loadCalendarData(filters.value.employeeId)
  }
  // 4) Montar FullCalendar
  initCalendar()
})
</script>

<style>
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
  background-color: white;
  border-radius: var(--border-radius-md);
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
  background-color: white;
  border-radius: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
}

/* El elemento `<div class="calendar">` necesita altura para verse */
.calendar {
  min-height: 500px;
}

.holiday-event {
  font-weight: bold;
}

.vacation-event {
  font-weight: bold;
}

.workday-event {
  font-weight: bold;
}

@media (max-width: 768px) {
  .calendar-filters {
    flex-direction: column;
  }
  .display-filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
