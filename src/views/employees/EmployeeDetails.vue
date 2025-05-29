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
            <option v-for="c in centrosTrabajo" :key="c.id" :value="c.nombre">
              {{ c.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.rol" class="form-control">
            <option disabled value="">Seleccione un rol</option>
            <option v-for="r in roles" :key="r.id" :value="r.nombre">
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
            {{ h.dia_nombre }} – {{ h.hora_entrada }} - {{ h.hora_salida }}
          </li>
        </ul>
        <button type="button" class="btn btn-outline" @click="openHorarios">Editar horarios</button>

        <h2>Vacaciones</h2>
        <ul>
          <li v-for="v in vacaciones" :key="v.id">
            {{ v.fecha_inicio }} → {{ v.fecha_fin }}
          </li>
        </ul>
        <button type="button" class="btn btn-outline" @click="openVacaciones">Gestionar vacaciones</button>

        <div class="actions">
          <button :disabled="saving" class="btn btn-azul">Guardar cambios</button>
          <button type="button" class="btn btn-danger" @click="remove">Eliminar empleado</button>
        </div>
      </form>

      <dialog ref="dlgHorarios" class="modal">
        <form @submit.prevent="saveHorarios">
          <h3>Horarios (L-V)</h3>
          <table class="table-horarios">
            <tr v-for="h in horarios" :key="h.dia_semana">
              <td>{{ h.dia_nombre }}</td>
              <td><input type="time" v-model="h.hora_entrada"></td>
              <td><input type="time" v-model="h.hora_salida"></td>
              <input type="hidden" v-model.number="h.dia_semana" />
            </tr>
          </table>
          <footer>
            <button class="btn">Guardar</button>
            <button type="button" class="btn btn-outline" @click="closeHorarios">Cerrar</button>
          </footer>
        </form>
      </dialog>

      <dialog ref="dlgVacaciones" class="modal">
        <h3>Vacaciones</h3>
        <table class="table-vacaciones">
          <tr v-for="v in vacaciones" :key="v.id">
            <td><input type="date" v-model="v.fecha_inicio"></td>
            <td><input type="date" v-model="v.fecha_fin"></td>
            <td><input type="number" v-model.number="v.dias_solicitados" min="1"></td>
            <td><input type="checkbox" v-model="v.aprobada"></td>
            <td>
              <button @click="updateVac(v)" class="btn-small">💾</button>
              <button @click="delVac(v.id)" class="btn-small btn-danger">🗑️</button>
            </td>
          </tr>
        </table>
        <h4>Añadir</h4>
        <div class="add-vac">
          <input type="date" v-model="nuevaVac.fecha_inicio">
          <input type="date" v-model="nuevaVac.fecha_fin">
          <input type="number" v-model.number="nuevaVac.dias_solicitados" min="1">
          <button @click="addVac" class="btn-plus">➕</button>
        </div>
        <footer>
          <button type="button" class="btn btn-outline" @click="closeVacaciones">Cerrar</button>
        </footer>
      </dialog>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../services/api.js'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

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
  dias_vacaciones_asignados: 0,
  empleado_id: null,
  usuario_id: null
})

const empleadoId = ref(null)
const horarios   = ref([])
const vacaciones = ref([])

const dlgHorarios = ref(null)
const dlgVacaciones = ref(null)

function openHorarios() {
  dlgHorarios.value?.showModal()
}

function closeHorarios() {
  dlgHorarios.value?.close()
}

function openVacaciones() {
  dlgVacaciones.value?.showModal()
}

function closeVacaciones() {
  dlgVacaciones.value?.close()
}

onMounted(loadData)

const roles = ref([])
const centrosTrabajo = ref([])

async function loadData () {
  try {
    loading.value = true

    const emp = await api.getEmpleado(id)
    console.log('[loadData] Empleado recibido:', emp)
    Object.assign(form, emp)

    empleadoId.value = emp.empleado_id
    console.log('[loadData] empleadoId real encontrado:', empleadoId.value)

    if (!empleadoId.value) throw new Error('No se encontró el empleado vinculado a este usuario.')

    const rolesData = await api.getRoles()
    roles.value = rolesData

    const centrosData = await api.getWorkCenters()
    centrosTrabajo.value = centrosData

    form.rol = emp.rol
    form.centro_trabajo = emp.centro_trabajo

    const horariosData = await api.getSchedules(emp.usuario_id)
    console.log('[loadData] horarios:', horariosData)
    horarios.value = Array.isArray(horariosData) ? horariosData.map(h => ({ ...h })) : []

    const vacacionesData = await api.getVacaciones(emp.empleado_id)
    console.log('[loadData] vacaciones:', vacacionesData)
    vacaciones.value = Array.isArray(vacacionesData) ? vacacionesData.map(v => ({ ...v })) : []
    

  } catch (e) {
    error.value = 'No se pudo cargar el empleado'
    console.error('[loadData] ERROR:', e)
  } finally {
    loading.value = false
  }
}

const editHorarios    = ref(false)
const vacacionesModal = ref(false)

const nuevaVac = reactive({
  fecha_inicio: '', fecha_fin:'', dias_solicitados:1
})

async function saveHorarios () {
  try {
    for (const h of horarios.value) {
      if (h.id) {
        await api.updateSchedule(h.id, {
          dia_semana    : h.dia_semana,
          hora_entrada  : h.hora_entrada,
          hora_salida   : h.hora_salida
        })
      } else {
        await api.createSchedule({
          empleado_id    : empleadoId.value,
          dia_semana    : h.dia_semana,
          hora_entrada  : h.hora_entrada,
          hora_salida   : h.hora_salida
        })
      }
    }
    alert('Horarios guardados')
    editHorarios.value = false
  } catch (e) {
    alert('No se pudo guardar horarios')
    console.error(e)
  }
}



async function addVac () {
  if (!nuevaVac.fecha_inicio || !nuevaVac.fecha_fin || !nuevaVac.dias_solicitados) {
    alert("Completa todos los campos para añadir vacaciones")
    return
  }

  try {
    const vacacionNueva = {
      empleado_id: empleadoId.value,
      fecha_inicio: nuevaVac.fecha_inicio,
      fecha_fin: nuevaVac.fecha_fin,
      dias_solicitados: nuevaVac.dias_solicitados,
      aprobada: true
    }

    await api.createVacaciones(vacacionNueva)
    await recargarVacaciones()

    Object.assign(nuevaVac, {
      fecha_inicio: '',
      fecha_fin: '',
      dias_solicitados: 1
    })

  } catch(e) {
    console.error("Error al añadir vacaciones:", e)
    alert("No se pudo añadir la vacación")
  }
}

async function updateVac (v) {
  try {
    await api.updateVacaciones(v.id, v)
    alert('Actualizado')
  } catch(e){ console.error(e) }
}

async function delVac (vid) {
  if (!confirm('¿Eliminar estas vacaciones?')) return
  try {
    await api.deleteVacaciones(vid)
    await recargarVacaciones()
  } catch(e){ console.error(e) }
}

async function recargarVacaciones () {
  console.log('[recargarVacaciones] ejecutando con ID:', empleadoId.value)
  if (!empleadoId.value || isNaN(empleadoId.value)) {
    console.warn("ID inválido al cargar vacaciones:", empleadoId.value)
    return
  }

  const vacacionesData = await api.getVacaciones(empleadoId.value)
  console.log('[recargarVacaciones] respuesta:', vacacionesData)
  vacaciones.value = Array.isArray(vacacionesData) ? vacacionesData.map(v => ({ ...v })) : []
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
.employee-details { 
  padding: 20px; 
}
.card { 
  background: #fff; 
  border-radius: 4px; 
  box-shadow: 0 2px 4px rgba(0,0,0,.1); 
  padding: 20px; 
}
.form-group { 
  margin-bottom: 1rem; 
}
.form-row { 
  display: flex; 
  gap: 1rem; 
  flex-wrap: wrap; 
}
.form-control { 
  width: 100%; 
  padding: .5rem; 
  border: 1px solid #ddd; 
  border-radius: 4px; 
}
.actions { 
  margin-top: 1rem; 
  display: flex; 
  gap: .5rem; 
}
.error { 
  color: #d32f2f; 
  margin-top: 1rem; 
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0,0,0,.2);
  width: min(90vw, 600px);
  z-index: 1000;
  background: white;
}

.table-horarios td,
.dialog[open] {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.table-vacaciones {
  width: 100%;
  max-width: 500px;
  margin: 1rem auto;
  border-collapse: collapse;
  text-align: center;
}

.table-vacaciones td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.table-vacaciones input[type="date"],
.table-vacaciones input[type="number"] {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

.table-vacaciones input[type="checkbox"] {
  transform: scale(1.2);
}

.btn-small {
  font-size: 1rem;
  padding: 0.2rem;
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
}

.btn-small:hover {
  color: #0d47a1;
}

.btn-small.btn-danger {
  color: #d32f2f;
}

.btn-small.btn-danger:hover {
  color: #b71c1c;
}

.btn-danger {
  background-color: #d32f2f;
}

.btn-azul {
  background-color: #0d47a1;
}

.add-vac {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin: 1rem 0;
}

.add-vac input {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

</style>
