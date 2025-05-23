<template>
    <div>
      <h1>Días Festivos</h1>
  
      <form @submit.prevent="handleSubmit">
        <label for="fecha">Fecha:</label>
        <input id="fecha" v-model="form.fecha" type="date" required />
  
        <label for="descripcion">Descripción:</label>
        <input id="descripcion" v-model="form.descripcion" type="text" required />
  
        <button type="submit" :disabled="saving">
          {{ editingFestivo ? 'Actualizar' : 'Crear' }} Festivo
        </button>
      </form>
  
      <ul>
        <li v-for="festivo in festivos" :key="festivo.id">
          {{ formatDate(festivo.fecha) }} - {{ festivo.descripcion }}
          <button @click="editFestivo(festivo)">Editar</button>
          <button @click="deleteFestivo(festivo.id)">Eliminar</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import { api } from '../../services/api.js'
  
  export default {
    name: 'Holidays',
    setup() {
      const festivos = ref([])
      const form = ref({ fecha: '', descripcion: '' })
      const editingFestivo = ref(null)
      const loading = ref(false)
      const saving = ref(false)
  
      const fetchFestivos = async () => {
        loading.value = true
        try {
          festivos.value = await api.getFestivos()
        } catch (e) {
          alert('Error al cargar festivos')
        } finally {
          loading.value = false
        }
      }
  
      const handleSubmit = async () => {
        saving.value = true
        try {
          if (editingFestivo.value) {
            await api.updateFestivo(editingFestivo.value.id, form.value)
          } else {
            await api.createFestivo(form.value)
          }
          await fetchFestivos()
          form.value = { fecha: '', descripcion: '' }
          editingFestivo.value = null
        } catch (e) {
          alert('Error al guardar festivo')
        } finally {
          saving.value = false
        }
      }
  
      const deleteFestivo = async (id) => {
        if (confirm('¿Seguro que quieres eliminar este festivo?')) {
          try {
            await api.deleteFestivo(id)
            await fetchFestivos()
          } catch (e) {
            alert('Error al eliminar festivo')
          }
        }
      }
  
      const editFestivo = (festivo) => {
        editingFestivo.value = festivo
        form.value = { fecha: festivo.fecha.slice(0, 10), descripcion: festivo.descripcion }
      }
  
      const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString()
      }
  
      onMounted(fetchFestivos)
  
      return {
        festivos,
        form,
        editingFestivo,
        loading,
        saving,
        handleSubmit,
        deleteFestivo,
        editFestivo,
        formatDate
      }
    }
  }
  </script>
  
  <style scoped>
  form {
    margin-bottom: 1rem;
  }
  label, input, button {
    display: block;
    margin: 0.5rem 0;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 0.5rem;
  }
  </style>
  