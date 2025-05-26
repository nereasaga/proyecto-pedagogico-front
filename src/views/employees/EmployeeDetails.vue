<template>
  <div class="employee-details">
    <h1>Detalles de Empleado</h1>

    <div v-if="loading">Cargando…</div>
    <div v-else>
      <form @submit.prevent="save" class="card">
        <h2>Datos Personales</h2>

        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="form.nombre_completo" class="form-control" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" class="form-control" type="email" />
        </div>

        <div class="form-group">
  <label>Centro de trabajo</label>
  <select v-model="form.centro_trabajo" class="form-control">
    <option disabled value="">Seleccione un centro</option>
    <option v-for="c in centrosTrabajo" :key="c.id" :value="c.id">
      {{ c.nombre }}
    </option>
  </select>
</div>

<div class="form-group">
  <label>Rol</label>
  <select v-model="form.rol" class="form-control">
    <option disabled value="">Seleccione un rol</option>
    <option v-for="r in roles" :key="r.id" :value="r.id">
      {{ r.nombre }}
    </option>
  </select>
</div>


        <h2>Jornadas</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Semanal (h)</label>
            <input v-model.number="form.jornada_semanal_horas" class="form-control" type="number" />
          </div>
          <div class="form-group">
            <label>Anual (h)</label>
            <input v-model.number="form.jornada_anual_horas" class="form-control" type="number" />
          </div>
          <div class="form-group">
            <label>Días vacaciones asignados</label>
            <input v-model.number="form.dias_vacaciones_asignados" class="form-control" type="number" />
          </div>
        </div>

        <h2>Horarios</h2>
        <ul>
          <li v-for="h in horarios" :key="h.id">
            {{ h.dia_nombre }} – {{ h.hora_entrada }}-{{ h.hora_salida }}
          </li>
        </ul>

        <h2>Vacaciones</h2>
        <ul>
          <li v-for="v in vacaciones" :key="v.id">
            {{ v.fecha_inicio }} → {{ v.fecha_fin }}
          </li>
        </ul>

        <div class="actions">
          <button :disabled="saving" class="btn">Guardar cambios</button>
          <button type="button" class="btn btn-outline" @click="remove">Eliminar empleado</button>
        </div>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const loading = ref(true)
const saving  = ref(false)
const error   = ref('')

const form = reactive({
  nombre_completo: '',
  email: '',
  rol: '',
  centro_trabajo: '',
  jornada_semanal_horas: 0,
  jornada_anual_horas: 0,
  dias_vacaciones_asignados: 0
})

const horarios   = ref([])
const vacaciones = ref([])

onMounted(loadData)

const roles = ref([])
const centrosTrabajo = ref([])

async function loadData () {
  try {
    loading.value = true
    // info
    const emp = await api.getEmpleado(id)
    console.log('Empleado recibido:', emp)
    Object.assign(form, emp)

    // holidays and schedules
    const calendario = await api.getCalendario(id)

    horarios.value   = calendario.horarios_semanales
    vacaciones.value = calendario.vacaciones_registradas
    // horarios.value   = await api.getSchedules(id)

    // load roles and work centers
    roles.value = await api.getRoles()
    centrosTrabajo.value = await api.getWorkCenters()
  } catch (e) {
    error.value = 'No se pudo cargar el empleado'
    console.error(e)
  } finally {
    loading.value = false
  }
}


async function save () {
  saving.value = true
  try {
    await api.updateEmpleado(id, form)
    alert('Actualizado')
  } catch (e) {
    alert('No se pudo guardar')
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function remove () {
  if (!confirm('¿Eliminar este empleado?')) return
  try {
    await api.deleteEmpleado(id)
    alert('Empleado eliminado')
    router.push('/employees')
  } catch (e) {
    alert('No se pudo eliminar')
    console.error(e)
  }
}

</script>

<style scoped>
.employee-details { padding: 20px; }
.card { background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,.1); padding: 20px; }
.form-group { margin-bottom: 1rem; }
.form-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.form-control { width: 100%; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
.actions { margin-top: 1rem; display: flex; gap: .5rem; }
.error { color: #d32f2f; margin-top: 1rem; }
</style>
