<template>
  <div class="dashboard-card">
    <h2>Calendarios</h2>
    
    <!-- Icono de calendario -->
    <svg xmlns="http://www.w3.org/2000/svg" 
         class="calendar-icon" 
         width="40" height="40" 
         viewBox="0 0 24 24" 
         fill="none" stroke="currentColor" 
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>

    <p class="dashboard-text">
      Accede rápidamente a la gestión de calendarios laborales.
    </p>

    <div class="card-footer">
      <router-link :to="link">
        <button class="btn">Ver Calendario</button>
      </router-link>
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

