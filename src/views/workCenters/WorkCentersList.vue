<template>
  <div class="centros-container">
    <h1 class="text-2xl font-bold mb-6 text-primary">Centros de Trabajo</h1>

    <!-- Formulario para añadir nuevo centro -->
    <div class="card">
      <h2 class="text-xl font-semibold mb-4 border-b pb-2">Añadir Nuevo Centro</h2>

      <form @submit.prevent="addNewWorkCenter" class="form-grid">
        <div class="forms-grid">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              v-model="newCenter.nombre"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              v-model="newCenter.ubicacion"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <div class="flex justify-end">
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
            <strong>#{{ center.id }}</strong> -
            <router-link :to="`/work-centers/${center.id}`" class="text-primary hover:text-primary-dark">
              {{ center.nombre }}
            </router-link>
            <span>({{ center.ubicacion }})</span>
          </div>
          <div class="action-buttons">
            <button @click="openEditModal(center)" class="btn-outline">Editar</button>
            <button @click="confirmDelete(center)" class="btn btn-danger">Eliminar</button>
          </div>
        </li>

        <li v-if="workCentersStore.workCenters.length === 0" class="text-gray-500 text-center py-4">
          No hay centros de trabajo registrados
        </li>
      </ul>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="card w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Editar Centro de Trabajo</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="updateWorkCenter" class="form-grid">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              v-model="editingCenter.nombre"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              v-model="editingCenter.ubicacion"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
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

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  margin-bottom: 2rem;
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
label{
  margin:0.5rem
}
  </style>