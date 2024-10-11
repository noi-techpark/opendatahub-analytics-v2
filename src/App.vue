<template>
  <div class="page-ct">
    <Sidebar />

    <div class="main-ct">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './components/nav/Sidebar.vue'
</script>

<style lang="postcss" scoped>
.page-ct {
  @apply relative flex;

  & .main-ct {
    @apply ml-[350px];
  }
}
</style>
