<!-- src/components/CalendarView.vue -->
<script setup>
import { ref } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'


const events = ref([
  {
    start: '2025-05-21 09:00',
    end: '2025-05-21 10:00',
    title: 'Reunión equipo',
    content: 'Sala A',
    class: 'evento-importante',
  }
])
</script>

<template>
  <VueCal
    style="height: 700px;"
    default-view="week"
    :time-from="8 * 60"
    :time-to="18 * 60"
    locale="es"
    :events="events"
    :on-event-click="(e) => console.log(e)"
  />
</template>

<style>
.vuecal__event.evento-importante {
  background-color: #ef4444;
  color: white;
  font-weight: bold;
}
</style>
