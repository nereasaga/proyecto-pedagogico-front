<script setup>
import { onMounted } from 'vue';
import { useEmployeesStore } from '@/stores/employees';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';

const store = useEmployeesStore();

onMounted(store.fetchEmployees);

async function handleSubmit(formData) {
  try {
    await store.addEmployee(formData);
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="employees-list">
    <h1>Gestión de Empleados</h1>

    <div class="card">
      <h2>Nuevo empleado</h2>
      <EmployeeForm @submit="handleSubmit" />
    </div>

    <div class="card">
      <h2>Empleados</h2>

      <div v-if="store.loading">Cargando…</div>
      <div v-else-if="store.error" class="error">{{ store.error }}</div>

      <!-- Mostrar tabla solo si no está cargando ni hay error -->
      <table v-if="!store.loading && !store.error" class="employees-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Email</th>
            <th>Centro</th><th>Rol</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in store.employees" :key="emp.usuario_id">
            <td>{{ emp.nombre_completo }}</td>
            <td>{{ emp.email }}</td>
            <td>{{ emp.centro_trabajo }}</td>
            <td>{{ emp.rol }}</td>
            <td>
              <router-link :to="`/employees/${emp.usuario_id}`" class="btn-small">Ver</router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!store.loading && !store.error" class="employees-cards">
        <div v-for="emp in store.employees" :key="emp.usuario_id" class="employee-card">
          <p><strong>Nombre:</strong> {{ emp.nombre_completo }}</p>
          <p><strong>Email:</strong> {{ emp.email }}</p>
          <p><strong>Centro:</strong> {{ emp.centro_trabajo }}</p>
          <p><strong>Rol:</strong> {{ emp.rol }}</p>
          <router-link :to="`/employees/${emp.usuario_id}`" class="btn-small">Ver más</router-link>
        </div>
      </div>
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
.employees-cards {
  display: none;
}

.employees-table {
  width: 100%;
  border-collapse: collapse;
}


@media (max-width: 768px) {
  .employees-table {
    display: none;
  }

  .employees-cards {
    display: block;
  }

  .employee-card {
    background: white;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }

  .employee-card p {
    margin: 6px 0;
  }

  .btn-small {
    display: inline-block;
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #1976D2;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
  }
}
</style>