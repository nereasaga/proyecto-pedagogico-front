<script setup>
import { ref } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit'])

const formData = ref({
  nombre_completo: props.initialData.nombre_completo || '',
  email: props.initialData.email || '',
  password: '',
  rol: props.initialData.rol || 'Empleado',
  centro_trabajo: props.initialData.centro_trabajo || '',
  jornada_semanal_horas: props.initialData.jornada_semanal_horas || 40,
  jornada_anual_horas: props.initialData.jornada_anual_horas || 1780,
  dias_vacaciones_asignados: props.initialData.dias_vacaciones_asignados || 22
})

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="employee-form">
    <div class="form-group">
      <label>Nombre Completo</label>
      <input 
        v-model="formData.nombre_completo"
        type="text"
        required
      >
    </div>

    <div class="form-group">
      <label>Email</label>
      <input 
        v-model="formData.email"
        type="email"
        required
      >
    </div>

    <div class="form-group">
      <label>Contraseña</label>
      <input 
        v-model="formData.password"
        type="password"
        :required="!initialData.id"
      >
    </div>

    <div class="form-group">
      <label>Rol</label>
      <select v-model="formData.rol" required>
        <option value="Empleado">Empleado</option>
        <option value="Responsable de Área">Responsable de Área</option>
        <option value="Administrador">Administrador</option>
      </select>
    </div>

    <div class="form-group">
      <label>Centro de Trabajo</label>
      <select v-model="formData.centro_trabajo" required>
        <option value="Barcelona">Barcelona</option>
        <option value="Madrid">Madrid</option>
        <option value="Málaga">Málaga</option>
      </select>
    </div>

    <div class="form-group">
      <label>Horas Semanales</label>
      <input 
        v-model.number="formData.jornada_semanal_horas"
        type="number"
        min="1"
        max="60"
        required
      >
    </div>

    <div class="form-group">
      <label>Horas Anuales</label>
      <input 
        v-model.number="formData.jornada_anual_horas"
        type="number"
        min="1"
        required
      >
    </div>

    <div class="form-group">
      <label>Días de Vacaciones</label>
      <input 
        v-model.number="formData.dias_vacaciones_asignados"
        type="number"
        min="0"
        required
      >
    </div>

    <button type="submit" class="btn btn-primary">
      {{ initialData.id ? 'Actualizar' : 'Crear' }} Empleado
    </button>
  </form>
</template>

<style>
.employee-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #1976D2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565C0;
}
</style>