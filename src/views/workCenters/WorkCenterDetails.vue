<template>
  <div class="centros-container">
    <div v-if="workCenter">
      <div class="cabecera-detalle">
        <h1 class="titulo-principal">{{ workCenter.nombre }}</h1>
        <router-link
          to="/work-centers"
          class="btn btn-outline"
        >
          Volver a la lista
        </router-link>
      </div>

      <!-- Detalles del centro -->
      <div class="card">
        <h2 class="titulo-seccion">Información del Centro</h2>

        <div class="data-grid">
          <div class="data-grid-item">
            <p class="etiqueta-secundaria">ID</p>
            <p class="texto-destacado">{{ workCenter.id }}</p>
          </div>

          <div class="data-grid-item">
            <p class="etiqueta-secundaria">Nombre</p>
            <p class="texto-destacado">{{ workCenter.nombre }}</p>
          </div>

          <div class="data-grid-item">
            <p class="etiqueta-secundaria">Ubicación</p>
            <p class="texto-destacado">{{ workCenter.ubicacion }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mensaje-vacio">
      <p class="texto-vacio">Centro de trabajo no encontrado</p>
      <router-link
        to="/work-centers"
        class="btn btn-volver"
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

.data-grid {
  display: flex; 
  flex-wrap: wrap; /* Allow items to wrap to the next line */
  gap: 1.5rem;
}

.data-grid-item {
  border: 1px solid #e8dede;
  padding: 1rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column; /* Stack items vertically within each item */
  flex: 1 1 calc(50% - 0.75rem); /* For large screens, two columns */
}
/* Mobile styles: single column */
@media (max-width: 768px) {
  .data-grid-item {
    flex: 1 1 100%; /* Take full width on small screens */
  }
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

.cabecera-detalle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.titulo-principal {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1976d2;
}

.titulo-seccion {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.etiqueta-secundaria {
  font-size: 0.875rem;
  color: #777;
  margin-bottom: 0.25rem;
}

.texto-destacado {
  font-weight: 500;
}

.texto-vacio {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 1rem;
  text-align: center;
}

.btn-volver {
  display: inline-block;
  margin-top: 1rem;
}

.mensaje-vacio {
  text-align: center;
  padding: 2rem 0;
}
</style>
