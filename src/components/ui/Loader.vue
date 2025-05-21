<template>
   <div class="loading-ct" :class="{ active }">
      <SpinnerIcon class="loading-indicator animate-spin" />
   </div>
</template>

<script setup lang="ts">
import SpinnerIcon from './svg/SpinnerIcon.vue'

defineProps<{ active: boolean }>()
</script>

<style lang="postcss" scoped>
.loading-ct {
   @apply pointer-events-none absolute inset-0 z-[999] flex items-center justify-center bg-black-2/50 opacity-0 transition-all;

   & .loading-indicator {
      @apply size-10 text-white;
   }

   &.active {
      @apply pointer-events-auto opacity-100;
   }
}
</style>
