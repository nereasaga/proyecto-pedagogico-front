import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWorkCentersStore } from './workCenters'

export const useHolidaysStore = defineStore('holidays', () => {
  const workCentersStore = useWorkCentersStore()
  
  // State
  const holidays = ref([
    // National holidays (Spain)
    { 
      id: 1, 
      date: '2025-01-01', 
      name: 'Año Nuevo', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2] // Applies to all work centers in Spain
    },
    { 
      id: 2, 
      date: '2025-01-06', 
      name: 'Epifanía del Señor', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 3, 
      date: '2025-04-18', 
      name: 'Viernes Santo', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 4, 
      date: '2025-05-01', 
      name: 'Día del Trabajo', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 5, 
      date: '2025-08-15', 
      name: 'Asunción de la Virgen', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 6, 
      date: '2025-10-12', 
      name: 'Fiesta Nacional de España', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 7, 
      date: '2025-11-01', 
      name: 'Todos los Santos', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 8, 
      date: '2025-12-06', 
      name: 'Día de la Constitución Española', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 9, 
      date: '2025-12-08', 
      name: 'Inmaculada Concepción', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    { 
      id: 10, 
      date: '2025-12-25', 
      name: 'Navidad', 
      type: 'national',
      country: 'Spain',
      workCenterIds: [1, 2]
    },
    
    // Regional holidays
    { 
      id: 11, 
      date: '2025-03-19', 
      name: 'San José', 
      type: 'regional',
      region: 'Madrid',
      workCenterIds: [2]
    },
    { 
      id: 12, 
      date: '2025-09-11', 
      name: 'Diada Nacional de Catalunya', 
      type: 'regional',
      region: 'Cataluña',
      workCenterIds: [1]
    },
    
    // Local holidays
    { 
      id: 13, 
      date: '2025-05-15', 
      name: 'San Isidro', 
      type: 'local',
      city: 'Madrid',
      workCenterIds: [2]
    },
    { 
      id: 14, 
      date: '2025-09-24', 
      name: 'La Mercè', 
      type: 'local',
      city: 'Barcelona',
      workCenterIds: [1]
    }
  ])
  
  // Getters
  const getAllHolidays = computed(() => holidays.value)
  
  const getHolidaysByType = computed(() => (type) => {
    return holidays.value.filter(holiday => holiday.type === type)
  })
  
  const getHolidaysByWorkCenter = computed(() => (workCenterId) => {
    return holidays.value.filter(holiday => 
      holiday.workCenterIds.includes(parseInt(workCenterId))
    )
  })
  
  const getHolidaysByDate = computed(() => (date) => {
    return holidays.value.filter(holiday => holiday.date === date)
  })
  
  // Get company special days and combine with holidays
  const getAllSpecialDays = computed(() => (workCenterId) => {
    const workCenter = workCentersStore.getWorkCenterById(workCenterId)
    if (!workCenter) return []
    
    // Get regular holidays for this work center
    const workCenterHolidays = getHolidaysByWorkCenter.value(workCenterId).map(holiday => ({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type
    }))
    
    // Get company special days
    const companyDays = workCenter.specialDays.map(day => ({
      date: day.date,
      name: day.name,
      type: 'company'
    }))
    
    // Combine both arrays
    return [...workCenterHolidays, ...companyDays]
  })
  
  // Actions
  function addHoliday(holiday) {
    const newId = holidays.value.length > 0 
      ? Math.max(...holidays.value.map(h => h.id)) + 1 
      : 1
    
    holidays.value.push({
      ...holiday,
      id: newId
    })
    
    return newId
  }
  
  function updateHoliday(id, updatedHoliday) {
    const index = holidays.value.findIndex(holiday => holiday.id === parseInt(id))
    if (index !== -1) {
      holidays.value[index] = { ...holidays.value[index], ...updatedHoliday }
      return true
    }
    return false
  }
  
  function deleteHoliday(id) {
    const index = holidays.value.findIndex(holiday => holiday.id === parseInt(id))
    if (index !== -1) {
      holidays.value.splice(index, 1)
      return true
    }
    return false
  }
  
  // Add a holiday to a specific work center
  function addHolidayToWorkCenter(holidayId, workCenterId) {
    const holiday = holidays.value.find(h => h.id === parseInt(holidayId))
    if (!holiday) return false
    
    if (!holiday.workCenterIds.includes(parseInt(workCenterId))) {
      holiday.workCenterIds.push(parseInt(workCenterId))
    }
    return true
  }
  
  // Remove a holiday from a specific work center
  function removeHolidayFromWorkCenter(holidayId, workCenterId) {
    const holiday = holidays.value.find(h => h.id === parseInt(holidayId))
    if (!holiday) return false
    
    const index = holiday.workCenterIds.indexOf(parseInt(workCenterId))
    if (index !== -1) {
      holiday.workCenterIds.splice(index, 1)
      return true
    }
    return false
  }
  
  return {
    holidays,
    getAllHolidays,
    getHolidaysByType,
    getHolidaysByWorkCenter,
    getHolidaysByDate,
    getAllSpecialDays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    addHolidayToWorkCenter,
    removeHolidayFromWorkCenter
  }
})