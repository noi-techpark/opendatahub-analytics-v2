<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <table :id="id" class="data-table" :data-test="id">
      <slot></slot>
   </table>
</template>

<script setup lang="ts">
import { randomId } from '../utils/useRandomId'

withDefaults(defineProps<{ id?: string }>(), { id: randomId() })
</script>

<style lang="postcss" scoped>
.data-table {
   @apply w-full table-fixed border-separate border-spacing-0;
}

.data-table :deep(th),
.data-table :deep(td) {
   @apply border border-gray-200;
}
.data-table :deep(tbody tr) {
   @apply align-top;
}
</style>
