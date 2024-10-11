<template>
  <div class="divider" />
</template>

<script lang="ts" setup></script>

<style lang="postcss" scoped>
.divider {
  @apply h-[1px] w-full bg-primary/10;
}

@media only screen and (max-width: theme('screens.md')) {
  .divider {
  }
}
</style>
