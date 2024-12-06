<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <p class="custom-p" :class="{ bold, label, small }">
      <slot />
   </p>
</template>

<script lang="ts" setup>
type Props = {
   bold?: boolean
   small?: boolean
   label?: boolean
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.custom-p {
   @apply text-sm font-normal leading-[1.31rem];

   &.label {
      @apply text-[0.75rem] leading-[1.13rem];
   }

   &.bold {
      @apply font-semibold;
   }

   &.small {
      @apply text-xs;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .custom-p {
   }
}
</style>
