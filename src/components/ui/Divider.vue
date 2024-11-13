<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="divider" :class="{ 'no-top': noTop, 'no-bottom': noBottom }" />
</template>

<script lang="ts" setup>
type Props = {
   noTop?: boolean
   noBottom?: boolean
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.divider {
   @apply my-2 h-[1px] w-full bg-stroke;

   &.no-top {
      @apply mt-0;
   }

   &.no-bottom {
      @apply mb-0;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .divider {
   }
}
</style>
