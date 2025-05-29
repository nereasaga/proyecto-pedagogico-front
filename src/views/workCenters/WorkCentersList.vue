<template>
  <div class="centros-container">
    <h1 class="titulo-principal">Centros de Trabajo</h1>

    <!-- Formulario para añadir nuevo centro -->
    <div class="card">
      <h2 class="titulo-seccion">Añadir Nuevo Centro</h2>

      <form @submit.prevent="addNewWorkCenter" class="form-grid">
        <div class="centros-grid">
          <div>
            <label class="etiqueta">Nombre</label>
            <input
              v-model="newCenter.nombre"
              type="text"
              required
              class="input-texto"
            />
          </div>

          <div>
            <label class="etiqueta">Ubicación</label>
            <input
              v-model="newCenter.ubicacion"
              type="text"
              required
              class="input-texto"
            />
          </div>
        </div>

        <div class="alinear-derecha">
          <button type="submit" class="btn">
            Añadir Centro
          </button>
        </div>
      </form>
    </div>

    <!-- Listado de centros -->
    <div class="card centros-list">
      <ul>
        <li
          v-for="center in workCentersStore.workCenters"
          :key="center.id"
          class="centros-item"
        >
          <div>
        
            <router-link :to="`/work-centers/${center.id}`" class="enlace-detalle">
              {{ center.nombre }}
            </router-link>
            <span>  -  ({{ center.ubicacion }})</span>
          </div>
          <div class="action-buttons">
            <button @click="openEditModal(center)" class="btn-outline">Editar</button>
            <button @click="confirmDelete(center)" class="btn btn-danger">Eliminar</button>
          </div>
        </li>

        <li v-if="workCentersStore.workCenters.length === 0" class="mensaje-vacio">
          No hay centros de trabajo registrados
        </li>
      </ul>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="card modal">
        <div class="modal-encabezado">
          <h2 class="titulo-seccion">Editar Centro de Trabajo</h2>
          <button @click="closeEditModal" class="cerrar-modal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="updateWorkCenter" class="centros-grid">
          <div>
            <label class="etiqueta">Nombre</label>
            <input
              v-model="editingCenter.nombre"
              type="text"
              required
              class="input-texto"
            />
          </div>

          <div>
            <label class="etiqueta">Ubicación</label>
            <input
              v-model="editingCenter.ubicacion"
              type="text"
              required
              class="input-texto"
            />
          </div>

          <div class="alinear-derecha espaciado-botones">
            <button
              type="button"
              @click="closeEditModal"
              class="btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn"
              :disabled="updating"
            >
              {{ updating ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useWorkCentersStore } from '@/stores/workCenters'

// Store
const workCentersStore = useWorkCentersStore()

// Estado para nuevo centro
const newCenter = ref({
  nombre: '',
  ubicacion: ''
})

// Estado para edición
const showEditModal = ref(false)
const editingCenter = ref({
  id: null,
  nombre: '',
  ubicacion: ''
})
const updating = ref(false)

// Cargar centros al montar el componente
onMounted(() => {
  workCentersStore.fetchWorkCenters()
})

// Añadir nuevo centro
async function addNewWorkCenter() {
  try {
    await workCentersStore.addWorkCenter({
      nombre: newCenter.value.nombre,
      ubicacion: newCenter.value.ubicacion
    })

    // Limpiar formulario
    newCenter.value = {
      nombre: '',
      ubicacion: ''
    }

    // Mostrar mensaje de éxito (opcional)
    alert('Centro de trabajo añadido correctamente')
  } catch (error) {
    alert('Error al añadir el centro de trabajo')
  }
}

// Abrir modal de edición
function openEditModal(center) {
  editingCenter.value = {
    id: center.id,
    nombre: center.nombre,
    ubicacion: center.ubicacion
  }
  showEditModal.value = true
}

// Cerrar modal de edición
function closeEditModal() {
  showEditModal.value = false
  editingCenter.value = {
    id: null,
    nombre: '',
    ubicacion: ''
  }
}

// Actualizar centro de trabajo
async function updateWorkCenter() {
  updating.value = true
  try {
    await workCentersStore.updateWorkCenter(editingCenter.value.id, {
      nombre: editingCenter.value.nombre,
      ubicacion: editingCenter.value.ubicacion
    })
    
    closeEditModal()
    alert('Centro de trabajo actualizado correctamente')
  } catch (error) {
    alert('Error al actualizar el centro de trabajo')
  } finally {
    updating.value = false
  }
}

// Confirmar eliminación
async function confirmDelete(center) {
  if (confirm(`¿Estás seguro de que deseas eliminar el centro "${center.nombre}"?`)) {
    try {
      await workCentersStore.deleteWorkCenter(center.id)
      alert('Centro eliminado correctamente')
    } catch (error) {
      alert('Error al eliminar el centro')
    }
  }
}
</script>
 <style scoped>
.centros-container {
  padding: 1.25rem;
}

.titulo-principal {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: black
}

.titulo-seccion {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.etiqueta {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}

.input-texto {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.alinear-derecha {
  display: flex;
  justify-content: flex-end;
}

.espaciado-botones {
  gap: 0.75rem;
  display: flex;
  padding-top: 1rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.centros-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.centros-item {
  display: grid;
  gap: 0.75rem;
}

.centros-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.centros-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.enlace-detalle {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.enlace-detalle:hover {
  color: #125aa9;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}
button {
  margin:0.4rem;
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
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
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

.mensaje-vacio {
  text-align: center;
  color: #888;
  padding: 2rem 0;
  font-size: 1rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  max-width: 500px;
  width: 100%;
  margin: 0 1rem;
}

.modal-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cerrar-modal {
  font-size: 1.5rem;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
}

.cerrar-modal:hover {
  color: #000;
}

label {
  margin: 0.5rem;
}
</style>
