<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="flex-1 overflow-x-auto">
      <table
         :id="id"
         class="data-table w-full table-fixed border-separate border-spacing-0"
         :data-test="id"
      >
         <slot></slot>
      </table>
   </div>
</template>

<script setup lang="ts">
import { randomId } from '../utils/useRandomId'

withDefaults(defineProps<{ id?: string }>(), { id: randomId() })
</script>

<style scoped>
.data-table :deep(th),
.data-table :deep(td) {
   @apply border border-gray-200;
}
.data-table :deep(tbody tr) {
   @apply align-top;
}
</style>
