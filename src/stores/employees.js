import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getEmployeeById = computed(() => (id) => {
    return employees.value.find(emp => emp.usuario_id === parseInt(id))
  })

  const getEmployeesByWorkCenter = computed(() => (centroId) => {
    return employees.value.filter(emp => emp.centro_trabajo === centroId)
  })

  async function fetchEmployees() {
    try {
      loading.value = true
      const data = await api.getEmpleados()
      employees.value = data
    } catch (err) {
      error.value = 'Error al cargar empleados'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addEmployee(employeeData) {
    try {
      loading.value = true
      const data = await api.createEmpleado(employeeData)
      await fetchEmployees() // Refresh list
      return data
    } catch (err) {
      error.value = 'Error al crear empleado'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEmployee(id, employeeData) {
    try {
      loading.value = true
      await api.updateEmpleado(id, employeeData)
      await fetchEmployees() // Refresh list
    } catch (err) {
      error.value = 'Error al actualizar empleado'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEmployee(id) {
    try {
      loading.value = true
      await api.deleteEmpleado(id)
      await fetchEmployees() // Refresh list
    } catch (err) {
      error.value = 'Error al eliminar empleado'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    employees,
    loading,
    error,
    getEmployeeById,
    getEmployeesByWorkCenter,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
})