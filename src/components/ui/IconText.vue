<template>
   <div
      class="icon-text-component __clickable"
      :class="{
         hover,
         reverse,
         grow,
         'no-padding': noPadding,
         'no-padding-x': noPaddingX,
         'no-padding-y': noPaddingY,
      }"
   >
      <slot />
      <P :bold :small v-if="text">{{ text }}</P>
   </div>
</template>

<script lang="ts" setup>
import P from './tags/P.vue'

type Props = {
   text?: string
   hover?: boolean
   bold?: boolean
   small?: boolean
   grow?: boolean
   reverse?: boolean
   noPadding?: boolean
   noPaddingX?: boolean
   noPaddingY?: boolean
}
const props = withDefaults(defineProps<Props>(), {
   hover: true,
})
</script>

<style lang="postcss" scoped>
.icon-text-component {
   @apply inline-flex select-none items-center gap-2 rounded px-3 py-[6px] text-sm transition-colors;

   &.grow {
      @apply w-full justify-between;
   }
   &.no-padding {
      @apply p-0;
   }

   &.no-padding-x {
      @apply px-0;
   }

   &.no-padding-y {
      @apply py-0;
   }

   &.reverse {
      @apply flex-row-reverse;
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
