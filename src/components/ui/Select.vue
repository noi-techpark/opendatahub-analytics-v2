<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="select-component" :class="{ open, list: type === 'list' }">
      <div class="select-trigger __clickable" @click="toggleOpen">
         <div class="select-text">
            <span class="select-title">
               {{ text }}
            </span>
            <span v-if="type === 'list' && values" class="select-value">
               {{ values[selectedIdx || 0].title }}
            </span>
         </div>
         <div class="select-icon">
            <ArrowDownIcon />
         </div>
      </div>

      <div class="select-content">
         <slot />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ArrowDownIcon from './svg/ArrowDownIcon.vue'

type Props = {
   text: string
   type?: 'dropdown' | 'list'
   selectedIdx?: number
   values?: {
      title: string
      value: number
   }[]
}

const props = withDefaults(defineProps<Props>(), {
   type: 'dropdown',
})

const open = ref<boolean>(false)

const toggleOpen = () => {
   open.value = !open.value
}
</script>

<style lang="postcss" scoped>
.select-component {
   @apply relative;

   &.open {
      & .select-trigger {
         @apply bg-green-light;

         & .select-icon {
            @apply -rotate-180;
         }
      }

      & .select-content {
         @apply pointer-events-auto translate-y-0 opacity-100;
      }
   }

   &.list {
      & .select-trigger {
         & .select-text {
            @apply flex gap-1 border-r-0 pr-1;

            & .select-title {
               @apply text-grey-2;
            }
         }
      }
   }

   & .select-trigger {
      @apply flex items-center rounded border bg-grey;

      & .select-text {
         @apply select-none border-r px-3 py-1 text-sm font-semibold;
      }

      & .select-icon {
         @apply px-1 transition-all;
      }
   }

   & .select-content {
      @apply pointer-events-none absolute -bottom-6 z-0 translate-y-6 opacity-0 transition-all;
   }
}

@media (max-width: theme('screens.md')) {
   .select-component {
   }
}
</style>
