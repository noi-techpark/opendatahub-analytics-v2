<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div
      class="icon-text-component __clickable"
      :class="{
         hover,
         reverse,
         'no-padding': noPadding,
         'no-padding-x': noPaddingX,
      }"
   >
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
   noPadding?: boolean
   noPaddingX?: boolean
}
const props = withDefaults(defineProps<Props>(), {
   hover: true,
})
</script>

<style lang="postcss" scoped>
.icon-text-component {
   @apply inline-flex select-none items-center gap-2 rounded px-3 py-[6px] text-sm transition-colors;

   &.no-padding {
      @apply p-0;
   }

   &.no-padding-x {
      @apply px-0;
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
