import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'; // Import your api service


export const useWorkCentersStore = defineStore('workCenters', () => {
  // States
  const workCenters = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getWorkCenterById = computed(() => (id) => {
    return workCenters.value.find(center => center.id === parseInt(id))
  });


// Actions (Interacting with the API)
 // Actions (Now interacting with the API)
  async function fetchWorkCenters() {
    loading.value = true;
    error.value = null;
    try {
      workCenters.value = await api.getWorkCenters();
    } catch (err) {
      error.value = 'Error al cargar los centros de trabajo: ' + err.message;
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function addWorkCenter(workCenterPayload) {
    loading.value = true;
    error.value = null;
    try {
      // Asegurar que solo enviamos los campos correctos: nombre y ubicacion
      const payload = {
        nombre: workCenterPayload.nombre,
        ubicacion: workCenterPayload.ubicacion
      };
      const newWorkCenter = await api.createWorkCenter(payload);
      await fetchWorkCenters(); // Re-fetch to update the state with the new item
      return newWorkCenter.id; // Return the ID of the newly created item
    } catch (err) {
      error.value = 'Error al crear el centro de trabajo: ' + err.message;
      console.error(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkCenter(id, updatedWorkCenterPayload) {
    loading.value = true;
    error.value = null;
    try {
      await api.updateWorkCenter(id, updatedWorkCenterPayload);
      await fetchWorkCenters(); // Re-fetch to update the state
      return true;
    } catch (err) {
      error.value = 'Error al actualizar el centro de trabajo: ' + err.message;
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWorkCenter(id) {
    loading.value = true;
    error.value = null;
    try {
      await api.deleteWorkCenter(id);
      await fetchWorkCenters(); // Re-fetch to update the state
      return true;
    } catch (err) {
      error.value = 'Error al eliminar el centro de trabajo: ' + err.message;
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  }




  return {
    workCenters,
    loading,
    error,
    getWorkCenterById,
    fetchWorkCenters,
    addWorkCenter,
    updateWorkCenter,
    deleteWorkCenter
  };
});