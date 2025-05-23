<template>
    <div class="calendar-container">
      <h2 class="calendar-title">
        Calendario de {{ nombreEmpleado }}
      </h2>
  
      <!-- Calendario principal -->
      <VCalendar
        :attributes="calendarAttributes"
        :locale="'es'"
        :min-date="minDate"
        :max-date="maxDate"
        is-expanded
        class="calendar-box"/>
  
      <!-- Leyenda de colores -->
      <div class="legend">
        <LegendItem color="legend-blue" label="Día de trabajo" />
        <LegendItem color="legend-green" label="Vacaciones" />
        <LegendItem color="legend-red" label="Festivo" />
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted, defineComponent } from 'vue'
import { setupCalendar, Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/dist/style.css'
import LegendItem from './LegendItem.vue'

const nombreEmpleado = ref('')
const horarios = ref([])
const vacaciones = ref([])
const festivos = ref([])

async function cargarCalendario(usuarioId) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/calendario/4`)
    const data = await res.json()

    nombreEmpleado.value = data.nombre_empleado
    horarios.value = data.horarios_semanales
    vacaciones.value = data.vacaciones_registradas
    festivos.value = data.festivos_aplicables
  } catch (err) {
    console.error('Error al cargar calendario:', err)
  }
}

const dayMap = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
}

const calendarAttributes = computed(() => {
  const attrs = []

  const workWeekdays = horarios.value
    .map(h => dayMap[h.dia_semana])
    .filter(n => n !== undefined)

  if (workWeekdays.length) {
    attrs.push({
      key: 'workdays',
      highlight: { class: 'legend-blue' },
      popover: { label: 'Día de trabajo' },
      recurring: { weekdays: workWeekdays },
    })
  }

  vacaciones.value.forEach((v, i) => {
    attrs.push({
      key: `vac-${i}`,
      highlight: { class: 'legend-green' },
      popover: { label: `Vacaciones (${v.fecha_inicio} → ${v.fecha_fin})` },
      dates: { start: v.fecha_inicio, end: v.fecha_fin },
    })
  })

  festivos.value.forEach((f, i) => {
    attrs.push({
      key: `hol-${i}`,
      highlight: { class: 'legend-red' },
      popover: { label: f.descripcion },
      dates: f.fecha,
    })
  })

  return attrs
})

const today = new Date()
const minDate = new Date(today.getFullYear() - 1, 0, 1)
const maxDate = new Date(today.getFullYear() + 1, 11, 31)

onMounted(() => {
  cargarCalendario(1)
})


</script>
  
  <style scoped>
  .calendar-container {
    padding: 1rem;
    max-width: 56.25rem; 
    margin: 0 auto;
  }
  
  .calendar-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .calendar-box {
    box-shadow: 0 0.25rem 0.625rem rgba(0, 0, 0, 0.1); 
    border-radius: 1rem;
    overflow: hidden;
  }
  
  .legend {
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    font-size: 0.875rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-color {
    width: 1rem;
    height: 1rem; 
    border-radius: 0.25rem; 
    display: inline-block;
  }
  
  .legend-blue {
    background-color: #cfe2ff;
  }
  .legend-green {
    background-color: #b8f2cc;
  }
  .legend-red {
    background-color: #ffb3b3;
  }
  </style>