<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Centros de Trabajo</h1>
    
    <!-- Formulario para añadir nuevo centro -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Añadir Nuevo Centro</h2>
      
      <form @submit.prevent="addNewWorkCenter" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              v-model="newCenter.name" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input 
              v-model="newCenter.city" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input 
              v-model="newCenter.address" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <input 
              v-model="newCenter.province" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">País</label>
            <input 
              v-model="newCenter.country" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Añadir Centro
          </button>
        </div>
      </form>
    </div>
    
    <!-- Listado de centros -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="center in workCentersStore.workCenters" :key="center.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <router-link 
                :to="`/work-centers/${center.id}`"
                class="text-indigo-600 hover:text-indigo-900"
              >
                {{ center.name }}
              </router-link>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ center.address }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ center.city }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ center.province }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ center.country }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="confirmDelete(center)"
                class="text-red-600 hover:text-red-900 ml-4"
              >
                Eliminar
              </button>
            </td>
          </tr>
          
          <tr v-if="workCentersStore.workCenters.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No hay centros de trabajo registrados
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkCentersStore } from '@/stores/workCenters'

// Store
const workCentersStore = useWorkCentersStore()

// Estado para nuevo centro
const newCenter = ref({
  name: '',
  address: '',
  city: '',
  province: '',
  country: ''
})

// Añadir nuevo centro
function addNewWorkCenter() {
  workCentersStore.addWorkCenter({
    name: newCenter.value.name,
    address: newCenter.value.address,
    city: newCenter.value.city,
    province: newCenter.value.province,
    country: newCenter.value.country
  })
  
  // Limpiar formulario
  newCenter.value = {
    name: '',
    address: '',
    city: '',
    province: '',
    country: ''
  }
}

// Confirmar eliminación
function confirmDelete(center) {
  if (confirm(`¿Estás seguro de que deseas eliminar el centro "${center.name}"?`)) {
    workCentersStore.deleteWorkCenter(center.id)
  }
}
</script>
