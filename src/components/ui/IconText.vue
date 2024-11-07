<template>
   <div class="icon-text-component __clickable" :class="{ hover, reverse }">
      <slot />
      <P :bold v-if="text">{{ text }}</P>
   </div>
</template>

<script lang="ts" setup>
import P from './tags/P.vue'

type Props = {
   text?: string
   hover?: boolean
   bold?: boolean
   reverse?: boolean
}
const props = withDefaults(defineProps<Props>(), {
   hover: true,
})
</script>

<style lang="postcss" scoped>
.icon-text-component {
   @apply inline-flex select-none items-center gap-2 rounded px-3 py-[6px] text-sm transition-colors;

   &.reverse {
      @apply flex-row-reverse justify-between;
   }

   &.hover {
      &:hover {
         @apply bg-grey;
      }
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .icon-text-component {
   }
}
</style>
