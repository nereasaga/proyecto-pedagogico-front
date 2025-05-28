<script setup>
// Main layout for authenticated pages
</script>

<template>
  <div class="main-layout-container">
    <router-view />
  </div>
</template>

<style>
.main-layout-container {
  min-height: calc(100vh - 60px);
  background-color: var(--color-surface);
}
</style>