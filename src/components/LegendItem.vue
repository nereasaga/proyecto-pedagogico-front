<template>
    <div class="legend-item">
      <span :class="['legend-color', color]"></span>
      <span>{{ label }}</span>
    </div>
  </template>
  
  <script setup>
  defineProps({
    color: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  })
  </script>
  
  <style scoped>
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5em;
  }
  
  .legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border-radius: 3px;
  }
  
  .legend-blue {
    background-color: #3b82f6;
  }
  
  .legend-green {
    background-color: #10b981;
  }
  
  .legend-red {
    background-color: #ef4444;
  }
  </style>