<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="no-data">
      <P>{{ $t('common.no-data') }}</P>
   </div>
</template>

<script lang="ts" setup>
import P from './tags/P.vue'
</script>

<style lang="postcss" scoped>
.no-data {
   @apply flex items-center justify-center opacity-50;
}
</style>
