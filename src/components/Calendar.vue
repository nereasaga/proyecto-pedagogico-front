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
  },
  {
    start: '2025-05-20 09:00',
    end: '2025-05-20 10:00',
    title: 'Reunión equipo',
    content: 'Sala A',
    class: "none"
  }
])
</script>

<template>
    <div class="calendar-wrapper">
        <VueCal
            style="height: 700px;"
            default-view="week"
            :time-from="8 * 60"
            :time-to="20 * 60"
            locale="es"
            :events="events"
            :on-event-click="(e) => console.log(e)"
  />
</div>
</template>

<style>
.calendar-wrapper {
  overflow-x: auto;
  width: 100%;
  max-width: 100vw;
}


/* Style for today's cell */
.vuecal__cell-today {
  background-color: #ffffff !important;
  color: #4311b9 !important;
  font-weight: bold;
  border: 2px solid #ff4700 !important;
  position: relative; 
  box-shadow: none !important;
  z-index: 2 !important;
}

.vuecal {
  background-color: #e5dff3;
  color: #4311b9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-width: 700px; 
  box-sizing: border-box;
}

/* Force grid */
.vuecal__week {
  display: grid !important;
  grid-template-columns: repeat(7, minmax(100px, 1fr)) !important;
  grid-auto-flow: row !important;
  width: 100% !important;
  min-width: 700px;
}


/* Calendar general styles */
.vuecal__header {
  background-color: #4311b9;
  color: #ffffff;
  font-weight: 600;
}


.vuecal__cell {
  min-height: 60px !important; 
  height: auto !important;
}

.vuecal__time-cell {
  min-height: 60px !important;
  height: auto !important;
}
.vuecal__event {
  height: auto !important;
  min-height: auto !important;
  white-space: normal !important;
  word-break: break-word !important;
  padding: 6px !important;
  line-height: 1.2;
}

.vuecal__event.evento-importante {
  background-color: #ef4444;
  color: white;
  font-weight: bold;
}


</style>