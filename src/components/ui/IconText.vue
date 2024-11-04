<template>
  <div class="icon-text-component __clickable">
    <slot />
    <P>{{ text }}</P>
  </div>
</template>

<script lang="ts" setup>
import P from './tags/P.vue'

type Props = {
  text: string
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.icon-text-component {
  @apply inline-flex items-center gap-2 px-3 py-[6px] select-none transition-colors rounded-small;

  &:hover {
    @apply bg-grey;
  }
}

@media only screen and (max-width: theme('screens.md')) {
  .icon-text-component {
  }
}
</style>
