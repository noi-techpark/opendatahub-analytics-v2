<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="w-full bg-gray-300">
      <div :style="{ width: `${percentage}%` }" class="bg-green-500 h-1"></div>
   </div>
</template>

<script setup lang="ts">
defineProps<{ percentage: number }>()
</script>
