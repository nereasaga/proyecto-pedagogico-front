<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="workCenter">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ workCenter.nombre }}</h1>
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
            <p class="text-sm text-gray-500">ID</p>
            <p class="font-medium">{{ workCenter.id }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Nombre</p>
            <p class="font-medium">{{ workCenter.nombre }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Ubicación</p>
            <p class="font-medium">{{ workCenter.ubicacion }}</p>
          </div>
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
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkCentersStore } from '@/stores/workCenters'

const route = useRoute()
const workCentersStore = useWorkCentersStore()

// Obtener ID del centro desde la ruta
const centerId = parseInt(route.params.id)

// Obtener centro de trabajo
const workCenter = computed(() => workCentersStore.getWorkCenterById(centerId))

// Cargar centros al montar el componente
onMounted(() => {
  workCentersStore.fetchWorkCenters()
})
</script>
