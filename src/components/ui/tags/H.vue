<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <component :is="tag" class="custom-h" :class="{ [tag]: true }">
      <slot />
   </component>
</template>

<script lang="ts" setup>
type Props = {
   tag: 'h1' | 'h2'
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.custom-h {
   @apply font-semibold text-black-2;

   &.h1 {
      @apply text-[1.5rem] leading-[2.25rem];
   }

   &.h2 {
      @apply text-[1.25rem] leading-[1.88rem];
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .custom-h {
   }
}
</style>
