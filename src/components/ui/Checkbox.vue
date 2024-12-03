<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

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
import CheckIcon from './svg/CheckIcon.vue'

type Props = {
   checked: boolean
   label: string
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.checkbox-component {
   @apply inline-flex select-none items-center gap-2 py-[6px] text-sm;

   & .checkbox-ct {
      @apply relative h-fit w-fit;

      & .checkbox {
         @apply size-5 appearance-none border transition-colors;

         &:checked {
            @apply border-green bg-green;
         }
      }

      & .check-icon {
         @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] transform;
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
