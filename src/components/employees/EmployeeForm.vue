<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '../../services/api.js'

const emit = defineEmits(['submit'])

const roles = ref([])
const centrosTrabajo = ref([])

const loading = ref(false)
const error = ref(null)

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const formData = reactive({
  nombre_completo: '',
  email: '',
  password: '',
  rol: null,
  centro_trabajo: null,
  jornada_semanal_horas: null,
  jornada_anual_horas: null,
  dias_vacaciones_asignados: null,
  horarios: diasSemana.map((dia, i) => ({
    dia_semana: i + 1,
    hora_entrada: '',
    hora_salida: ''
  }))
})

onMounted(loadData)

async function loadData () {
  try {
    loading.value = true
    roles.value = await api.getRoles()
    centrosTrabajo.value = await api.getWorkCenters()
  } catch (e) {
    error.value = 'No se pudo cargar roles o centros'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  emit('submit', JSON.parse(JSON.stringify(formData)))
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="employee-form">
    <div class="form-group">
      <label>Nombre Completo</label>
      <input v-model="formData.nombre_completo" type="text" required />
    </div>

    <div class="form-group">
      <label>Email</label>
      <input v-model="formData.email" type="email" required />
    </div>

    <div class="form-group">
      <label>Contraseña</label>
      <input v-model="formData.password" type="password" required />
    </div>

    <div class="form-group">
      <label>Centro de trabajo</label>
      <select v-model="formData.centro_trabajo" class="form-control" required>
        <option disabled value="">Seleccione un centro</option>
        <option v-for="c in centrosTrabajo" :key="c.id" :value="c.nombre">{{ c.nombre }}</option>
      </select>
    </div>

    <div class="form-group">
      <label>Rol</label>
      <select v-model="formData.rol" class="form-control" required>
        <option disabled value="">Seleccione un rol</option>
        <option v-for="r in roles" :key="r.id" :value="r.nombre">{{ r.nombre }}</option>
      </select>
    </div>

    <div class="form-group">
      <label>Horas Semanales</label>
      <input v-model.number="formData.jornada_semanal_horas" type="number" min="1" max="60" required />
    </div>

    <div class="form-group">
      <label>Horas Anuales</label>
      <input v-model.number="formData.jornada_anual_horas" type="number" min="1" required />
    </div>

    <div class="form-group">
      <label>Días de Vacaciones Asignados</label>
      <input v-model.number="formData.dias_vacaciones_asignados" type="number" min="0" required />
    </div>

    <fieldset>
      <legend>Horarios (Lunes a Viernes)</legend>
      <div v-for="(horario, index) in formData.horarios" :key="horario.dia_semana" class="form-group horario-group">
        <label>{{ diasSemana[index] }}</label>
        <input type="time" v-model="horario.hora_entrada" required />
        <input type="time" v-model="horario.hora_salida" required />
      </div>
    </fieldset>

    <button type="submit" class="btn btn-primary">Crear Empleado</button>

    <p v-if="error" class="text-danger mt-2">{{ error }}</p>
  </form>
</template>

<style scoped>
.employee-form {
  max-width: 37rem;
  margin: 0 auto;
  padding: 1.25rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1976D2;
  outline: none;
}

.btn {
  display: inline-block;
  padding: 0.6rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #1976D2;
  color: #fff;
}

.btn-primary:hover {
  background-color: #1565C0;
}

.horario-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vacacion-group {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  background-color: #f9f9f9;
}

.vacacion-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.vacacion-group input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #ccc;
}

button {
  margin-top: 1rem;
}
</style>
