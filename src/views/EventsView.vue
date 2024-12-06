<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="events-view">
      <div class="header-ct">
         <H tag="h1">{{ $t('views.events.title') }}</H>
         <TimeSelector v-model="selectedTimeId" v-model:range="rangeCustom" />
      </div>

      table events
   </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import H from '../components/ui/tags/H.vue'
import TimeSelector from '../components/ui/TimeSelector.vue'
import { TimeEnum, TimeRange } from '../types/time-series'

const selectedTimeId = ref<TimeEnum>()
const rangeCustom = ref<TimeRange>()
</script>

<style lang="postcss" scoped>
.events-view {
   @apply flex flex-col gap-2;

   & .header-ct {
      @apply flex flex-col gap-2;
   }
}

@media (max-width: theme('screens.md')) {
   .events-view {
   }
}
</style>
