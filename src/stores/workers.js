// src/stores/workers.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useWorkersStore = defineStore('workers', () => {
  // Carga inicial desde localStorage
  const workers = ref(JSON.parse(localStorage.getItem('workers') || '[]'))

  // Añadir trabajador
  const addWorker = (worker) => {
    workers.value.push(worker)
  }

  // Actualizar trabajador (por id)
  const updateWorker = (updated) => {
    const idx = workers.value.findIndex(w => w.id === updated.id)
    if (idx !== -1) workers.value.splice(idx, 1, updated)
  }

  // Borrar trabajador
  const deleteWorker = (id) => {
    workers.value = workers.value.filter(w => w.id !== id)
  }

  // Persistencia automática
  watch(
    workers,
    (val) => {
      localStorage.setItem('workers', JSON.stringify(val))
    },
    { deep: true }
  )

  return { workers, addWorker, updateWorker, deleteWorker }
})
