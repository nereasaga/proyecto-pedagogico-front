<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Employee Details</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-gray-600">Employee ID: {{ id }}</p>
      <!-- Additional employee details will be added later -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>