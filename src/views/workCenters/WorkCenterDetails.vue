<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="workCenter">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ workCenter.name }}</h1>
        <router-link 
          to="/work-centers" 
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Volver a la lista
        </router-link>
      </div>
      
      <!-- Detalles del centro -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Información del Centro</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Dirección</p>
            <p class="font-medium">{{ workCenter.address }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">Ciudad</p>
            <p class="font-medium">{{ workCenter.city }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">Provincia</p>
            <p class="font-medium">{{ workCenter.province }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">País</p>
            <p class="font-medium">{{ workCenter.country }}</p>
          </div>
        </div>
      </div>
      
      <!-- Días especiales -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Días Especiales</h2>
          <button 
            @click="showAddSpecialDay = true"
            class="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            Añadir Día Especial
          </button>
        </div>
        
        <!-- Formulario para añadir día especial -->
        <div v-if="showAddSpecialDay" class="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 class="text-lg font-medium mb-3">Nuevo Día Especial</h3>
          
          <form @submit.prevent="addSpecialDay" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input 
                  v-model="newSpecialDay.date" 
                  type="date" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  v-model="newSpecialDay.name" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  v-model="newSpecialDay.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="company">Día de Empresa</option>
                  <option value="holiday">Festivo</option>
                  <option value="special">Día Especial</option>
                </select>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showAddSpecialDay = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
        
        <!-- Lista de días especiales -->
        <div v-if="workCenter.specialDays && workCenter.specialDays.length > 0">
          <ul class="divide-y divide-gray-200">
            <li v-for="day in workCenter.specialDays" :key="day.date" class="py-3 flex justify-between items-center">
              <div>
                <p class="font-medium">{{ formatDate(day.date) }} - {{ day.name }}</p>
                <p class="text-sm text-gray-500">{{ formatDayType(day.type) }}</p>
              </div>
              <button 
                @click="removeSpecialDay(day.date)"
                class="text-red-600 hover:text-red-900"
              >
                Eliminar
              </button>
            </li>
          </ul>
        </div>
        
        <div v-else class="text-gray-500 text-center py-4">
          No hay días especiales registrados para este centro
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-10">
      <p class="text-xl text-gray-600">Centro de trabajo no encontrado</p>
      <router-link 
        to="/work-centers" 
        class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Volver a la lista
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkCentersStore } from '@/stores/workCenters'

const route = useRoute()
const workCentersStore = useWorkCentersStore()

// Obtener ID del centro desde la ruta
const centerId = parseInt(route.params.id)

// Obtener centro de trabajo
const workCenter = computed(() => workCentersStore.getWorkCenterById(centerId))

// Estado para formulario de día especial
const showAddSpecialDay = ref(false)
const newSpecialDay = ref({
  date: '',
  name: '',
  type: 'company'
})

// Añadir día especial
function addSpecialDay() {
  workCentersStore.addSpecialDay(centerId, {
    date: newSpecialDay.value.date,
    name: newSpecialDay.value.name,
    type: newSpecialDay.value.type
  })
  
  // Limpiar y cerrar formulario
  newSpecialDay.value = {
    date: '',
    name: '',
    type: 'company'
  }
  showAddSpecialDay.value = false
}

// Eliminar día especial
function removeSpecialDay(date) {
  if (confirm('¿Estás seguro de que deseas eliminar este día especial?')) {
    workCentersStore.removeSpecialDay(centerId, date)
  }
}

// Formatear fecha
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

// Formatear tipo de día
function formatDayType(type) {
  const types = {
    company: 'Día de Empresa',
    holiday: 'Festivo',
    special: 'Día Especial'
  }
  return types[type] || type
}
</script>
