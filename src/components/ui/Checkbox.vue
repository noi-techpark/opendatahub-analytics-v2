<template>
   <label class="checkbox-component __clickable">
      <div class="checkbox-ct">
         <input
            class="checkbox"
            :class="{ 'rounded-full': rounded }"
            type="checkbox"
            :checked="props.checked"
         />
         <CheckIcon v-if="props.checked" class="check-icon" />
      </div>
      <span class="checkbox-text">{{ label }}</span>
   </label>
</template>

<script lang="ts" setup>
import CheckIcon from './svg/CheckIcon.vue'

type Props = {
   checked: boolean
   rounded?: boolean
   label: string
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.checkbox-component {
   @apply inline-flex select-none items-center gap-2 py-[6px] text-sm;

   & .checkbox-ct {
      @apply relative flex h-fit w-fit items-center;

      & .checkbox {
         @apply size-5 appearance-none border transition-colors;

         &:checked {
            @apply border-green bg-green;
         }
      }

      & .check-icon {
         @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform;
      }
   }

   & .checkbox-text {
      @apply flex-grow pb-1;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .checkbox {
   }
}
</style>
