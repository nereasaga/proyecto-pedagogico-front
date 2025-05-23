<script setup>
import { onMounted } from 'vue'
import { useEmployeesStore } from '../../stores/employees'
import EmployeeForm from '../../components/employees/EmployeeForm.vue'

const employeesStore = useEmployeesStore()

const handleSubmit = async (formData) => {
  try {
    await employeesStore.addEmployee(formData)
  } catch (error) {
    console.error('Error al crear empleado:', error)
  }
}

onMounted(() => {
  employeesStore.fetchEmployees()
})
</script>

<template>
  <div class="employees-list">
    <h1>Gestión de Empleados</h1>

    <div class="card">
      <h2>Nuevo Empleado</h2>
      <EmployeeForm @submit="handleSubmit" />
    </div>

    <div class="card">
      <h2>Empleados</h2>
      
      <div v-if="employeesStore.loading">Cargando...</div>
      
      <div v-else-if="employeesStore.error" class="error">
        {{ employeesStore.error }}
      </div>
      
      <table v-else>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Centro</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employeesStore.employees" :key="employee.usuario_id">
            <td>{{ employee.nombre_completo }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.centro_trabajo }}</td>
            <td>{{ employee.rol }}</td>
            <td>
              <router-link 
                :to="`/employees/${employee.usuario_id}`"
                class="btn btn-small"
              >
                Ver
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.employees-list {
  padding: 20px;
}

.card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.btn-small {
  padding: 5px 10px;
  font-size: 14px;
  text-decoration: none;
  background-color: #1976D2;
  color: white;
  border-radius: 4px;
}

.error {
  color: red;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>