<template>
    <div class="holidays-container">
      <h1>Días Festivos</h1>
  
      <!-- Lista de Festivos -->
      <section class="card festivos-list">
        <h2>Lista de Festivos</h2>
        <ul>
          <li v-for="festivo in festivos" :key="festivo.id" class="festivo-item">
            <span>{{ formatDate(festivo.fecha) }} - {{ festivo.descripcion }}</span>
            <div class="action-buttons">
              <button class="btn" @click="editFestivo(festivo)">Editar</button>
              <button class="btn btn-danger" @click="deleteFestivo(festivo.id)">Eliminar</button>
            </div>
          </li>
        </ul>
      </section>
  
      <!-- Forms -->
      <section class="forms-grid">
        <!-- Add holiday -->
        <div class="card">
          <h2>Añadir Festivo</h2>
          <form @submit.prevent="handleSubmit" class="form-grid">
            <label for="fecha">Fecha:</label>
            <input id="fecha" v-model="form.fecha" type="date" required />
  
            <label for="descripcion">Descripción:</label>
            <input id="descripcion" v-model="form.descripcion" type="text" required />
  
            <label for="tipo">Tipo de festivo:</label>
            <select id="tipo" v-model.number="form.tipo_festivo_id">
              <option disabled value="">Selecciona un tipo</option>
              <option v-for="tipo in tiposFestivo" :key="tipo.id" :value="tipo.id">
                {{ tipo.nombre }}
              </option>
            </select>

            <label for="centro-edit">Centro de trabajo:</label>
            <select id="centro-edit" v-model.number="form.centro_id" required>
                <option :value="null">Todos</option>
                <option v-for="centro in centrosTrabajo" :key="centro.id" :value="centro.id">
                    {{ centro.nombre }}
                </option>
            </select>
  
            <button type="submit" class="btn" :disabled="saving">
              Crear Festivo
            </button>
          </form>
        </div>
  
        <!-- Edit holiday -->
<div v-if="editingFestivo" class="card">
  <h2>Editar Festivo</h2>
  <form @submit.prevent="submitEdit" class="form-grid">
    <label for="fecha-edit">Fecha:</label>
    <input id="fecha-edit" v-model="editForm.fecha" type="date" required />

    <label for="descripcion-edit">Descripción:</label>
    <input id="descripcion-edit" v-model="editForm.descripcion" type="text" required />

    <label for="tipo-edit">Tipo de festivo:</label>
    <select id="tipo-edit" v-model.number="editForm.tipo_festivo_id" required>
      <option disabled value="">Selecciona un tipo</option>
      <option v-for="t in tiposFestivo" :key="t.id" :value="t.id">{{ t.nombre }}</option>
    </select>

    <label for="centro-edit">Centro de trabajo:</label>
    <select id="centro-edit" v-model.number="editForm.centro_id" required>
      <option :value="null">Todos</option>
      <option v-for="c in centrosTrabajo" :key="c.id" :value="c.id">{{ c.nombre }}</option>
    </select>

    <div class="form-actions">
      <button type="submit" class="btn" :disabled="saving">Actualizar</button>
      <button type="button" class="btn btn-outline" @click="cancelEdit">Cancelar</button>
    </div>
  </form>
</div>
      </section>
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { api } from '../../services/api.js'
  
  const festivos = ref([])
  const tiposFestivo = ref([])
  const centrosTrabajo = ref([])

const fetchCentrosTrabajo = async () => {
  try {
    centrosTrabajo.value = await api.getWorkCenters()
  } catch (e) {
    alert('Error al cargar centros de trabajo')
  }
}

  
const form = ref({
  fecha: '',
  descripcion: '',
  tipo_festivo_id: '',
  centro_id: null  
})
  const editForm = ref({ fecha: '', descripcion: '', tipo_festivo_id: '', centro_id: null })
  const editingFestivo = ref(null)
  
  const loading = ref(false)
  const saving = ref(false)
  
  /* ────── FETCH ────── */
  const fetchFestivos = async () => {
    loading.value = true
    try {
      festivos.value = await api.getFestivos()
      console.log('festivos cargados:', festivos.value)
    } catch {
      alert('Error al cargar festivos')
    } finally {
      loading.value = false
    }
  }
  
  const fetchTiposFestivo = async () => {
    try {
      tiposFestivo.value = await api.getTiposFestivo()
    } catch {
      alert('Error al cargar tipos de festivo')
    }
  }
  
  /* ────── CREATE ────── */
  const handleSubmit = async () => {
    saving.value = true
    try {
      await api.createFestivo(form.value)
      await fetchFestivos()
      form.value = { fecha: '', descripcion: '', tipo_festivo_id: '', centro_id: null }
      console.log('Festivo creado:', form.value)
    } catch {
      alert('Error al guardar festivo')
    } finally {
      saving.value = false
    }
  }
  
  /* ────── EDIT ────── */
  const editFestivo = (f) => {
  editingFestivo.value = f
  editForm.value = {
    fecha: f.fecha.slice(0, 10),
    descripcion: f.descripcion,
    tipo_festivo_id: f.tipo_festivo_id,
    centro_id: f.centro_id_aplicable  
  }
}
  
  const submitEdit = async () => {
    saving.value = true
    try {
      await api.updateFestivo(editingFestivo.value.id, editForm.value)
      await fetchFestivos()
      cancelEdit()
    } catch {
      alert('Error al actualizar festivo')
    } finally {
      saving.value = false
    }
  }
  
  const cancelEdit = () => {
    editingFestivo.value = null
    editForm.value = { fecha: '', descripcion: '', tipo_festivo_id: '', centro_id: null }
  }
  
  /* ────── DELETE ────── */
  const deleteFestivo = async (id) => {
    if (!confirm('¿Eliminar este festivo?')) return
    try {
      await api.deleteFestivo(id)
      await fetchFestivos()
    } catch {
      alert('Error al eliminar festivo')
    }
  }
  
  /* ────── UTILS ────── */
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  
  onMounted(() => {
    fetchFestivos()
    fetchTiposFestivo()
    fetchCentrosTrabajo()
  })
  </script>
  
  <style scoped>
  .holidays-container {
  padding: 1.25rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.festivos-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.festivo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.forms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn:hover {
  background: #125aa9;
}

.btn-outline {
  background: transparent;
  border: 1px solid #1976d2;
  color: #1976d2;
}

.btn-outline:hover {
  background: #1976d2;
  color: white;
}

.btn-danger {
  background-color: #d32f2f;
}

.btn-danger:hover {
  background-color: #b71c1c;
}

  </style>
  