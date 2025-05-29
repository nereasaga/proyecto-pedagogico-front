<template>
  <div class="dashboard">
    <header>
      <h1>Bienvenido, {{ userName }}</h1>
    </header>

    <!-- ADMIN & MANAGER -->
    <div v-if="isAdmin || isManager" class="card-grid">
      <EmployeesCard />
      <HolidaysCard />
      <CalendarCard />
    </div>

    <!-- EMPLOYEE -->
    <div v-else-if="isEmployee" class="card-grid">
      <CalendarCard />
      <HolidaysCard />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

import EmployeesCard from '@/components/dashboard/EmployeesCard.vue'
import HolidaysCard  from '@/components/dashboard/HolidaysCard.vue'
import CalendarCard  from '@/components/dashboard/CalendarCard.vue'

const auth = useAuthStore()
const userName   = computed(() => auth.user?.name || '')
const userRole   = computed(() => auth.userRole)
const isAdmin    = computed(() => userRole.value === 'admin')
const isManager  = computed(() => ['admin', 'manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')
</script>

<style>
.dashboard {
  width: 100%;
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.dashboard-card {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md); /* más pronunciada */
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 15rem;
  padding: var(--spacing-md);
  transition: box-shadow var(--transition-fast);
}

.dashboard-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.dashboard-text{
  margin-top: 2rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-breakdown {
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}
.calendar-icon{
  color: var(--color-primary);
  margin-top: 0.7rem;
}

.upcoming-list {
  margin-top: var(--spacing-md);
}

.upcoming-list h3 {
  font-size: 1rem;
  margin-bottom: var(--spacing-sm);
}

.upcoming-list ul {
  list-style: none;
  padding: 0;
}

.upcoming-list li {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--color-border);
  list-style: none;
}

.upcoming-list li:last-child {
  border-bottom: none;
}

.upcoming-date {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.upcoming-name {
  font-weight: 600;
}

.card-footer {
  margin-top: auto;
  padding-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>