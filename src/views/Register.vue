<template>
  <div class="register-page">
    <h2 class="title">Registrar/Editar Trabajador</h2>
    <form @submit.prevent="save">
      <!-- Datos personales -->
      <div class="field">
        <label>Nombre</label>
        <input v-model="form.firstName" type="text" required />
      </div>
      <div class="field">
        <label>Apellidos</label>
        <input v-model="form.lastName" type="text" required />
      </div>
      <!-- Centro -->
      <div class="field">
        <label>Centro de trabajo</label>
        <select v-model="form.center" required>
          <option disabled value="">Selecciona...</option>
          <option value="Barcelona">Barcelona</option>
          <option value="Madrid">Madrid</option>
        </select>
      </div>
      <!-- Rol -->
      <div class="field">
        <label>Rol</label>
        <select v-model="form.role" required>
          <option disabled value="">Selecciona...</option>
          <option value="Administrador">Administrador</option>
          <option value="Responsable de Área">Responsable de Área</option>
          <option value="Empleado">Empleado</option>
        </select>
      </div>
      <!-- Jornada y horas anuales -->
      <div class="field">
        <label>Jornada semanal (h)</label>
        <input
          v-model.number="form.weeklyHours"
          type="number"
          min="0"
          max="40"
          required
        />
      </div>
      <div class="readonly">
        Horas anuales: <strong>{{ annualHours }}</strong>
      </div>
      <!-- Meses trabajados & vacaciones -->
      <div class="field">
        <label>Meses trabajados</label>
        <input
          v-model.number="form.monthsWorked"
          type="number"
          min="0"
          max="12"
          required
        />
      </div>
      <div class="readonly">
        Días vacaciones naturales: <strong>{{ naturalVacations }}</strong><br/>
        Días vacaciones laborables: <strong>{{ workdayVacations }}</strong>
      </div>
      <!-- Horarios por día -->
      <div class="schedule">
        <h3>Horarios</h3>
        <div
          class="day-row"
          v-for="day in form.schedule"
          :key="day.name"
        >
          <label>{{ day.name }}</label>
          <input v-model="day.start" type="time" required />
          <input v-model="day.end" type="time" required />
        </div>
      </div>
      <!-- Botón Guardar/Actualizar -->
      <button type="submit" class="btn-primary">
        {{ editingId ? 'Actualizar' : 'Crear' }}
      </button>
      <button
        v-if="editingId"
        type="button"
        class="btn-outline"
        @click="resetForm"
      >
        Cancelar
      </button>
    </form>

    <!-- Lista de trabajadores -->
    <div class="list">
      <h3>Trabajadores registrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Centro</th>
            <th>Rol</th>
            <th>J Semanal</th>
            <th>Vacac. nat.</th>
            <th>Vacac. lab.</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in workers" :key="w.id">
            <td>{{ w.firstName }} {{ w.lastName }}</td>
            <td>{{ w.center }}</td>
            <td>{{ w.role }}</td>
            <td>{{ w.weeklyHours }}h</td>
            <td>{{ w.naturalVacations }}</td>
            <td>{{ w.workdayVacations }}</td>
            <td>
              <button @click="edit(w)" class="btn-sm">✎</button>
              <button @click="remove(w.id)" class="btn-sm-outline">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useWorkersStore } from '../stores/workers'

const store = useWorkersStore()
const workers = store.workers

const defaultSchedule = [
  { name: 'Lunes', start: '09:00', end: '17:00' },
  { name: 'Martes', start: '09:00', end: '17:00' },
  { name: 'Miércoles', start: '09:00', end: '17:00' },
  { name: 'Jueves', start: '09:00', end: '17:00' },
  { name: 'Viernes', start: '09:00', end: '17:00' },
  { name: 'Sábado', start: '00:00', end: '00:00' },
  { name: 'Domingo', start: '00:00', end: '00:00' }
]

const form = reactive({
  id: null,
  firstName: '',
  lastName: '',
  center: '',
  role: '',
  weeklyHours: 40,
  monthsWorked: 12,
  schedule: JSON.parse(JSON.stringify(defaultSchedule))
})

const annualHours = computed(() => form.weeklyHours * 52)
const naturalVacations = computed(() =>
  +(form.monthsWorked * 2.5).toFixed(1)
)
const workdayVacations = computed(() =>
  +(form.monthsWorked * 1.8).toFixed(1)
)

const editingId = ref(null)

function save() {
  const payload = {
    id: editingId.value || Date.now(),
    firstName: form.firstName,
    lastName: form.lastName,
    center: form.center,
    role: form.role,
    weeklyHours: form.weeklyHours,
    annualHours: annualHours.value,
    monthsWorked: form.monthsWorked,
    naturalVacations: naturalVacations.value,
    workdayVacations: workdayVacations.value,
    schedule: JSON.parse(JSON.stringify(form.schedule))
  }

  if (editingId.value) {
    store.updateWorker(payload)
  } else {
    store.addWorker(payload)
  }
  resetForm()
}

function edit(w) {
  editingId.value = w.id
  form.firstName = w.firstName
  form.lastName = w.lastName
  form.center = w.center
  form.role = w.role
  form.weeklyHours = w.weeklyHours
  form.monthsWorked = w.monthsWorked
  form.schedule = JSON.parse(JSON.stringify(w.schedule))
}

function remove(id) {
  if (confirm('¿Seguro que quieres borrar?')) {
    store.deleteWorker(id)
  }
}

function resetForm() {
  editingId.value = null
  form.firstName = ''
  form.lastName = ''
  form.center = ''
  form.role = ''
  form.weeklyHours = 40
  form.monthsWorked = 12
  form.schedule = JSON.parse(JSON.stringify(defaultSchedule))
}
</script>

<style scoped>
.register-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
}
.title {
  text-align: center;
  margin-bottom: 1rem;
}
form {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.3rem;
  color: #4b5563;
}
.field input,
.field select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}
.readonly {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: #374151;
}
.schedule {
  margin-bottom: 1rem;
}
.day-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.day-row label {
  width: 80px;
}
.btn-primary {
  background: var(--primary);
  color: #fff;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.6rem 1rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}
.list table {
  width: 100%;
  border-collapse: collapse;
}
.list th,
.list td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.btn-sm {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
}
.btn-sm-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.25rem;
}
</style>
