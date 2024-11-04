<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="divider" />
</template>

<script lang="ts" setup></script>

<style lang="postcss" scoped>
.divider {
  @apply h-[1px] w-full bg-stroke my-2;
}

@media only screen and (max-width: theme('screens.md')) {
  .divider {
  }
}
</style>
