<template>
    <div class="dashboard-card">
      <h2>Calendarios</h2>
      <p>Accede rápidamente a la gestión de calendarios laborales.</p>
      <div class="card-footer">
        <router-link :to="link"><button class="btn">Ver Calendario</button></router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  
  const { userRole, user } = useAuthStore()
  const link = computed(() =>
    userRole === 'employee' ? `/calendar/${user.employeeId}` : '/calendar'
  )
  </script>