<template>
  <label class="checkbox-component __clickable">
    <div class="checkbox-ct">
      <input class="checkbox" type="checkbox" :checked="props.checked" />
      <CheckIcon v-if="props.checked" class="check-icon" />
    </div>
    <span class="checkbox-text">{{ label }}</span>
  </label>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps } from 'vue'
import CheckIcon from './svg/CheckIcon.vue'

type Props = {
  checked: boolean
  label: string
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.checkbox-component {
  @apply inline-flex gap-2 items-center text-sm select-none py-[6px];

  & .checkbox-ct {
    @apply relative w-fit h-fit;

    & .checkbox {
      @apply appearance-none size-5 border-stroke border transition-colors;

      &:checked {
        @apply bg-green border-green;
      }
    }

    & .check-icon {
      @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[70%];
    }
  }

  & .checkbox-text {
    @apply pb-1 flex-grow;
  }
}

@media only screen and (max-width: theme('screens.md')) {
  .checkbox {
  }
}
</style>
