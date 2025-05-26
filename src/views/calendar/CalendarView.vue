<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendario Laboral</h1>
      <div class="calendar-filters">
        <!-- Centro de Trabajo (solo Admin) -->
        <div v-if="isAdmin" class="form-group">
          <label for="workCenterFilter">Centro de Trabajo</label>
          <select
            id="workCenterFilter"
            v-model="filters.workCenterId"
            @change="onWorkCenterChange"
            class="form-control"
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
          <label for="employeeFilter">Empleado</label>
          <select
            id="employeeFilter"
            v-model="filters.employeeId"
            @change="onEmployeeChange"
            :disabled="isEmployee"
            class="form-control"
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

        <!-- Mostrar/Ocultar toggles -->
        <div class="display-filters">
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showHolidays"
              @change="refreshCalendar"
            /> Mostrar festivos
          </label>
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showVacations"
              @change="refreshCalendar"
            /> Mostrar vacaciones
          </label>
          <label class="form-check">
            <input
              type="checkbox"
              v-model="filters.showWorkDays"
              @change="refreshCalendar"
            /> Mostrar días laborables
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
const route            = useRoute()
const authStore        = useAuthStore()
const employeesStore   = useEmployeesStore()
const workCentersStore = useWorkCentersStore()
const { getCalendario, getHorariosEmpleado, getEmpleado } = api

// ——— Calendar ref ———
const calendarEl = ref(null)
let calendar     = null

// ——— Filtros reactivos ———
const filters = ref({
  workCenterId: null,
  employeeId:   null,
  showHolidays:  true,
  showVacations: true,
  showWorkDays:  true
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

// ——— Empleados disponibles ———
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

// ——— Datos del backend ———
const festivos      = ref([])
const vacaciones    = ref([])
const workSchedules = ref([])
const annualHours   = ref(0)  // ← jornada_anual_horas

/** Carga festivos, vacaciones, horarios y jornada anual */
async function loadAllData(empId) {
  if (!empId) {
    festivos.value = []; vacaciones.value = []
    workSchedules.value = []; annualHours.value = 0
    return
  }
  // Festivos & Vacaciones
  try {
    const cal = await getCalendario(empId)
    festivos.value   = cal.festivos_aplicables    || []
    vacaciones.value = cal.vacaciones_registradas  || []
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

/** Convierte "HH:MM:SS" → horas decimales */
function parseHours(hms) {
  const [h, m] = hms.split(':').map(Number)
  return h + m/60
}

/** Genera eventos para el calendario con tope anual */
function generateEvents() {
  const evs = []
  let accumulated = 0

  // Festivos
  if (filters.value.showHolidays) {
    festivos.value.forEach(f => {
      evs.push({
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

  // Vacaciones
  if (filters.value.showVacations) {
    vacaciones.value
      .filter(v => v.aprobada)
      .forEach(v => {
        const end = new Date(v.fecha_fin)
        end.setDate(end.getDate() + 1)
        evs.push({
          title: 'Vacaciones',
          start: v.fecha_inicio,
          end:   end.toISOString().slice(0,10),
          allDay: true,
          classNames: ['vacation-event'],
          backgroundColor: '#ff9800',
          borderColor: '#ff9800',
          extendedProps: { type: 'vacation', days: v.dias_solicitados }
        })
      })
  }

  // Días laborables con límite de horas
  if (filters.value.showWorkDays && annualHours.value > 0) {
    const now  = new Date()
    const year = now.getFullYear()
    // Desde 1 de enero hasta fin de año
    let date = new Date(year, 0, 2)
    while (date.getFullYear() === year && accumulated < annualHours.value) {
      const ds = date.toISOString().slice(0,10)
      const dow = date.getDay()  // 1=lunes…5=viernes

      // ¿Festivo?
      const isHoliday = festivos.value.some(f => f.fecha === ds)
      // ¿Vacación?
      const isVacation = vacaciones.value.some(v => {
        const start = new Date(v.fecha_inicio),
              end   = new Date(v.fecha_fin)
        return v.aprobada && start <= date && date <= end
      })

      // Si festivo o vacación o fin acumulado, salta
      if (!isHoliday && !isVacation) {
        const sched = workSchedules.value.find(h => h.dia_semana + 1 === dow)
        if (sched) {
          const hrs = parseHours(sched.hora_salida) - parseHours(sched.hora_entrada)
          // ¿Cabría dentro del tope anual?
          if (accumulated + hrs <= annualHours.value) {
            evs.push({
              title: `${sched.hora_entrada} - ${sched.hora_salida}`,
              start: ds,
              allDay: true,
              classNames: ['workday-event'],
              backgroundColor: '#4caf50',
              borderColor: '#4caf50',
              extendedProps: { type: 'workday', hours: hrs }
            })
            accumulated += hrs
          } else {
            break
          }
        }
      }

      // Siguiente día
      date.setDate(date.getDate() + 1)
    }
  }

  return evs
}

/** Inicializa FullCalendar */
function initCalendar() {
  if (!calendarEl.value) return
  calendar = new Calendar(calendarEl.value, {
    plugins:       [ dayGridPlugin, interactionPlugin ],
    initialView:   'dayGridMonth',
    headerToolbar: { left:'prev,next today', center:'title', right:'dayGridMonth' },
    locale:        'es',
    locales:       [ esLocale ],
    firstDay:      1,
    height:        'auto',
    events:        generateEvents()
  })
  calendar.render()
}

/** Refresca solo los eventos */
function refreshCalendar() {
  if (!calendar) return
  calendar.removeAllEvents()
  calendar.addEventSource(generateEvents())
}

// — Watchers —
watch(
  () => filters.value.employeeId,
  async id => {
    await loadAllData(id)
    refreshCalendar()
  }
)
watch(
  () => filters.value.workCenterId,
  () => {
    filters.value.employeeId = null
    refreshCalendar()
  }
)
watch(
  () => [filters.value.showHolidays, filters.value.showVacations, filters.value.showWorkDays],
  () => refreshCalendar()
)

// — Handlers UI —
function onWorkCenterChange() { /* dispara watcher */ }
function onEmployeeChange()   { /* dispara watcher */ }

// — Lifecycle —
onMounted(async () => {
  await employeesStore.fetchEmployees()
  // Inicializa filtros desde ruta/rol
  const eid = route.params.employeeId
  filters.value.employeeId = eid != null
    ? Number(eid)
    : isEmployee.value
      ? authStore.user.employeeId
      : null
  await loadAllData(filters.value.employeeId)
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
