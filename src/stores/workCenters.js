import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkCentersStore = defineStore('workCenters', () => {
  // State
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
  ])
  
  // Getters
  const getWorkCenterById = computed(() => (id) => {
    return workCenters.value.find(center => center.id === parseInt(id))
  })
  
  // Actions
  function addWorkCenter(workCenter) {
    const newId = workCenters.value.length > 0 
      ? Math.max(...workCenters.value.map(wc => wc.id)) + 1 
      : 1
    
    workCenters.value.push({
      ...workCenter,
      id: newId,
      specialDays: []
    })
    
    return newId
  }
  
  function updateWorkCenter(id, updatedWorkCenter) {
    const index = workCenters.value.findIndex(center => center.id === parseInt(id))
    if (index !== -1) {
      workCenters.value[index] = { ...workCenters.value[index], ...updatedWorkCenter }
      return true
    }
    return false
  }
  
  function deleteWorkCenter(id) {
    const index = workCenters.value.findIndex(center => center.id === parseInt(id))
    if (index !== -1) {
      workCenters.value.splice(index, 1)
      return true
    }
    return false
  }
  
  function addSpecialDay(workCenterId, specialDay) {
    const workCenter = getWorkCenterById.value(workCenterId)
    if (!workCenter) return false
    
    workCenter.specialDays.push(specialDay)
    return true
  }
  
  function removeSpecialDay(workCenterId, date) {
    const workCenter = getWorkCenterById.value(workCenterId)
    if (!workCenter) return false
    
    const index = workCenter.specialDays.findIndex(day => day.date === date)
    if (index !== -1) {
      workCenter.specialDays.splice(index, 1)
      return true
    }
    return false
  }
  
  return {
    workCenters,
    getWorkCenterById,
    addWorkCenter,
    updateWorkCenter,
    deleteWorkCenter,
    addSpecialDay,
    removeSpecialDay
  }
})