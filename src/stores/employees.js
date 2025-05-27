import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';

export const useEmployeesStore = defineStore('employees', () => {
  /* state  */
  const employees = ref([]);
  const loading   = ref(false);
  const error     = ref(null);
  const workCenters = ref([]);

  /* getters */
  const getEmployeeById = computed(
    () => id => employees.value.find(e => e.usuario_id === Number(id))
  );

  const getEmployeesByWorkCenter = computed(
    () => centroNombre => employees.value.filter(e => e.centro_trabajo === centroNombre)
  );
    // Getter for work centers
  const getWorkCenters = computed(() => workCenters.value);

  /* actions  */
  async function fetchEmployees() {
    try {
      loading.value = true;
      employees.value = await api.getEmpleados();
      error.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function addEmployee(payload) {
    try {
      loading.value = true;
      await api.createEmpleado(payload);
      await fetchEmployees();
    } finally {
      loading.value = false;
    }
  }

  async function updateEmployee(id, payload) {
    try {
      loading.value = true;
      await api.updateEmpleado(id, payload);
      await fetchEmployees();
    } finally {
      loading.value = false;
    }
  }

  async function deleteEmployee(id) {
    try {
      loading.value = true;
      await api.deleteEmpleado(id);
      await fetchEmployees();
    } finally {
      loading.value = false;
    }
  }


  

  return {
    employees, loading, error,
    getEmployeeById, getEmployeesByWorkCenter,
    fetchEmployees, addEmployee, updateEmployee, deleteEmployee
  };
});


