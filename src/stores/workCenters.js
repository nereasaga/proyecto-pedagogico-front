import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'; // Import your api service


export const useWorkCentersStore = defineStore('workCenters', () => {
  // States
   const workCenters = ref([
    {
      id: 1,
      name: 'Barcelona',
      address: 'Carrer de Barcelona, 123',
      city: 'Barcelona',
      province: 'Barcelona',
      country: 'Spain',
      specialDays: [
        { date: '2025-05-15', name: 'Día de la Empresa', type: 'company' }
      ]
    },
    {
      id: 2,
      name: 'Madrid',
      address: 'Calle de Madrid, 456',
      city: 'Madrid',
      province: 'Madrid',
      country: 'Spain',
      specialDays: [
        { date: '2025-06-20', name: 'Aniversario de Fundación', type: 'company' }
      ]
    }
  ]);
  //const workCenters = ref([]);
  const loading = ref(false);  // Add loading state for API calls
  const error = ref(null);     // Add error state for API calls

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
      const newWorkCenter = await api.createWorkCenter(workCenterPayload);
      // Optionally, if the API returns the full new object:
      // workCenters.value.push(newWorkCenter);
      // Or, re-fetch all to ensure consistency:
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

  // --- Special Days (assuming they are handled via work center updates) ---
  // If special days are handled as nested objects within a work center,
  // these actions would typically call updateWorkCenter after modifying the workCenter object.
  // If your backend has separate endpoints for special days, you'd add those to api.js.

  async function addSpecialDay(workCenterId, specialDay) {
    loading.value = true;
    error.value = null;
    try {
      const workCenter = getWorkCenterById.value(workCenterId);
      if (!workCenter) {
        throw new Error('Centro de trabajo no encontrado para añadir día especial.');
      }
      const updatedWorkCenter = {
        ...workCenter,
        specialDays: [...workCenter.specialDays, specialDay]
      };
      await updateWorkCenter(workCenterId, updatedWorkCenter); // Use the store's update action
      return true;
    } catch (err) {
      error.value = 'Error al añadir día especial: ' + err.message;
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeSpecialDay(workCenterId, date) {
    loading.value = true;
    error.value = null;
    try {
      const workCenter = getWorkCenterById.value(workCenterId);
      if (!workCenter) {
        throw new Error('Centro de trabajo no encontrado para eliminar día especial.');
      }
      const updatedWorkCenter = {
        ...workCenter,
        specialDays: workCenter.specialDays.filter(day => day.date !== date)
      };
      await updateWorkCenter(workCenterId, updatedWorkCenter); // Use the store's update action
      return true;
    } catch (err) {
      error.value = 'Error al eliminar día especial: ' + err.message;
      console.error(err);
      return false;
    } finally {
      loading.value = false;
    }
  }


  return {
    workCenters,
    loading, // Expose loading state
    error,   // Expose error state
    getWorkCenterById,
    fetchWorkCenters, // Expose new fetch action
    addWorkCenter,
    updateWorkCenter,
    deleteWorkCenter,
    addSpecialDay,
    removeSpecialDay
  };
});