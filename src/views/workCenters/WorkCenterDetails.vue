<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Work Center Details</h1>
    <!-- Basic placeholder content -->
    <div class="bg-white rounded-lg shadow p-6">
      <p class="text-gray-600">Work Center details view</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkCenterDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>