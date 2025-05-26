<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useEmployeesStore } from '../../stores/employees'
import { useWorkCentersStore } from '../../stores/workCenters'
// import { useHolidaysStore } from '../../stores/holidays'

// Import FullCalendar core and plugins
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

const route = useRoute()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const workCentersStore = useWorkCentersStore()
const holidaysStore = useHolidaysStore()

// Calendar container ref
const calendarEl = ref(null)
let calendar = null

// Filter state
const filters = ref({
  workCenterId: null,
  employeeId: null,
  showHolidays: true,
  showVacations: true,
  showWorkDays: true
})

// User role information
const userRole = computed(() => authStore.userRole)
const isAdmin = computed(() => userRole.value === 'admin')
const isManager = computed(() => ['admin', 'manager'].includes(userRole.value))
const isEmployee = computed(() => userRole.value === 'employee')

// Get available work centers based on user role
const availableWorkCenters = computed(() => {
  if (isAdmin.value) {
    return workCentersStore.workCenters
  } else if (isManager.value) {
    const userWorkCenterId = authStore.user?.workCenter
    if (!userWorkCenterId) return []
    
    return workCentersStore.workCenters.filter(
      center => center.id === userWorkCenterId
    )
  }
  return []
})

// Get available employees based on selected work center and user role
const availableEmployees = computed(() => {
  if (isEmployee.value) {
    const employeeId = authStore.user?.employeeId
    if (!employeeId) return []
    
    const employee = employeesStore.getEmployeeById(employeeId)
    return employee ? [employee] : []
  }
  
  if (filters.value.workCenterId) {
    return employeesStore.getEmployeesByWorkCenter(filters.value.workCenterId)
  }
  
  if (isAdmin.value) {
    return employeesStore.employees
  }
  
  if (isManager.value) {
    const userWorkCenterId = authStore.user?.workCenter
    if (!userWorkCenterId) return []
    
    return employeesStore.getEmployeesByWorkCenter(userWorkCenterId)
  }
  
  return []
})

// Initialize with route params if provided
const initializeFromRoute = () => {
  const { employeeId } = route.params
  
  if (employeeId) {
    const employee = employeesStore.getEmployeeById(employeeId)
    if (employee) {
      filters.value.employeeId = parseInt(employeeId)
      filters.value.workCenterId = employee.workCenterId
    }
  } else if (isEmployee.value) {
    // If user is an employee, show their own calendar
    const employeeId = authStore.user?.employeeId
    if (employeeId) {
      const employee = employeesStore.getEmployeeById(employeeId)
      if (employee) {
        filters.value.employeeId = employeeId
        filters.value.workCenterId = employee.workCenterId
      }
    }
  } else if (isManager.value) {
    // If user is a manager, select their work center
    const workCenterId = authStore.user?.workCenter
    if (workCenterId) {
      filters.value.workCenterId = workCenterId
    }
  }
}

// Generate calendar events based on filters
const generateCalendarEvents = () => {
  const events = []
  
  // If no filters are applied, return empty array
  if (!filters.value.workCenterId && !filters.value.employeeId) {
    return events
  }
  
  // Get selected work center
  const workCenter = filters.value.workCenterId
    ? workCentersStore.getWorkCenterById(filters.value.workCenterId)
    : null
  
  // Get selected employee
  const employee = filters.value.employeeId
    ? employeesStore.getEmployeeById(filters.value.employeeId)
    : null
  
  // Add holidays if filter is enabled
  if (filters.value.showHolidays && workCenter) {
    const holidays = holidaysStore.getAllSpecialDays(workCenter.id)
    
    holidays.forEach(holiday => {
      events.push({
        title: holiday.name,
        start: holiday.date,
        allDay: true,
        classNames: ['holiday-event'],
        backgroundColor: '#ef5350',
        borderColor: '#ef5350',
        extendedProps: {
          type: 'holiday'
        }
      })
    })
  }
  
  // Add employee vacations if filter is enabled
  if (filters.value.showVacations && employee) {
    employee.vacations.forEach(vacation => {
      const startDate = new Date(vacation.start)
      const endDate = new Date(vacation.end)
      
      // Add one day to end date for inclusive range in FullCalendar
      endDate.setDate(endDate.getDate() + 1)
      
      events.push({
        title: 'Vacaciones',
        start: vacation.start,
        end: endDate.toISOString().split('T')[0],
        allDay: true,
        classNames: ['vacation-event'],
        backgroundColor: '#ff9800',
        borderColor: '#ff9800',
        extendedProps: {
          type: 'vacation',
          days: vacation.days
        }
      })
    })
  }
  
  // Add work schedule if filter is enabled
  if (filters.value.showWorkDays && employee) {
    // Get current date
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Generate work schedule for current month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ...
      
      // Skip weekends if no schedule is defined
      if (dayOfWeek === 0 && !employee.schedule.sunday) continue
      if (dayOfWeek === 6 && !employee.schedule.saturday) continue
      
      // Map day of week to schedule property
      const dayMap = [
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ]
      
      const scheduleDay = employee.schedule[dayMap[dayOfWeek]]
      
      // Skip if no schedule for this day
      if (!scheduleDay) continue
      
      // Format date string
      const dateString = date.toISOString().split('T')[0]
      
      // Check if date is a holiday or vacation
      const isHoliday = events.some(
        event => event.extendedProps?.type === 'holiday' && event.start === dateString
      )
      
      const isVacation = events.some(
        event => event.extendedProps?.type === 'vacation' && 
        new Date(event.start) <= date && new Date(event.end) > date
      )
      
      // Skip if date is a holiday or vacation
      if (isHoliday || isVacation) continue
      
      // Add work schedule event
      events.push({
        title: `${scheduleDay.start} - ${scheduleDay.end}`,
        start: dateString,
        allDay: true,
        classNames: ['workday-event'],
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        extendedProps: {
          type: 'workday',
          schedule: scheduleDay
        }
      })
    }
  }
  
  return events
}

// Update calendar with new events
const updateCalendar = () => {
  if (!calendar) return
  
  // Clear existing events
  calendar.removeAllEvents()
  
  // Generate new events based on filters
  const events = generateCalendarEvents()
  
  // Add events to calendar
  calendar.addEventSource(events)
}

// Handle filter changes
const handleFilterChange = () => {
  updateCalendar()
}

// Initialize calendar
const initializeCalendar = () => {
  if (!calendarEl.value) return
  
  // Create calendar instance
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    locale: 'es',
    firstDay: 1, // Monday as first day
    height: 'auto',
    events: generateCalendarEvents(),
    eventDidMount: (info) => {
      // Add tooltip with event details
      const type = info.event.extendedProps?.type
      
      let tooltipContent = info.event.title
      
      if (type === 'workday') {
        const schedule = info.event.extendedProps?.schedule
        if (schedule) {
          tooltipContent += ` (${schedule.break}h descanso)`
        }
      } else if (type === 'vacation') {
        tooltipContent = `Vacaciones (${info.event.extendedProps?.days} días laborables)`
      }
      
      info.el.title = tooltipContent
    }
  })
  
  // Render calendar
  calendar.render()
}

// Clean up calendar on component unmount
const cleanup = () => {
  if (calendar) {
    calendar.destroy()
    calendar = null
  }
}

onMounted(() => {
  // Initialize filters from route
  initializeFromRoute()
  
  // Initialize calendar
  initializeCalendar()
})
</script>

<template>
  <div class="calendar-view">
    <div class="calendar-header">
      <h1>Calendario Laboral</h1>
      
      <div class="calendar-filters">
        <!-- Work Center Filter (Admin only) -->
        <div v-if="isAdmin" class="form-group">
          <label for="workCenterFilter" class="form-label">Centro de Trabajo</label>
          <select 
            id="workCenterFilter"
            v-model="filters.workCenterId"
            class="form-control"
            @change="handleFilterChange"
          >
            <option :value="null">Todos los centros</option>
            <option 
              v-for="center in availableWorkCenters" 
              :key="center.id" 
              :value="center.id"
            >
              {{ center.name }}
            </option>
          </select>
        </div>
        
        <!-- Employee Filter -->
        <div class="form-group">
          <label for="employeeFilter" class="form-label">Empleado</label>
          <select 
            id="employeeFilter"
            v-model="filters.employeeId"
            class="form-control"
            @change="handleFilterChange"
            :disabled="isEmployee"
          >
            <option :value="null">Todos los empleados</option>
            <option 
              v-for="employee in availableEmployees" 
              :key="employee.id" 
              :value="employee.id"
            >
              {{ employee.name }}
            </option>
          </select>
        </div>
        
        <!-- Display Filters -->
        <div class="display-filters">
          <div class="form-check">
            <input 
              id="showHolidays"
              v-model="filters.showHolidays"
              type="checkbox"
              @change="handleFilterChange"
            >
            <label for="showHolidays">Mostrar festivos</label>
          </div>
          
          <div class="form-check">
            <input 
              id="showVacations"
              v-model="filters.showVacations"
              type="checkbox"
              @change="handleFilterChange"
            >
            <label for="showVacations">Mostrar vacaciones</label>
          </div>
          
          <div class="form-check">
            <input 
              id="showWorkDays"
              v-model="filters.showWorkDays"
              type="checkbox"
              @change="handleFilterChange"
            >
            <label for="showWorkDays">Mostrar días laborables</label>
          </div>
        </div>
      </div>
    </div>
    
    <div class="calendar-container">
      <div ref="calendarEl" class="calendar"></div>
    </div>
  </div>
</template>

<style>
.calendar-view {
  width: 100%;
}

.calendar-header {
  margin-bottom: var(--spacing-lg);
}

.calendar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.display-filters {
  display: flex;
  gap: var(--spacing-md);
}

.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.calendar-container {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
}

/* Calendar custom styling */
.calendar {
  min-height: 500px;
}

.holiday-event {
  font-weight: bold;
}

.vacation-event {
  font-weight: bold;
}

.workday-event {
  font-weight: bold;
}

@media (max-width: 768px) {
  .calendar-filters {
    flex-direction: column;
  }
  
  .display-filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>