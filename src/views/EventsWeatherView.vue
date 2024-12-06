<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="events-weather-view">
      <div class="header-ct">
         <H tag="h1">{{ $t('views.events-weather.title') }}</H>
         <TimeSelector v-model="selectedTimeId" />
      </div>

      table weather
   </main>
</template>

<script setup lang="ts">
import H from '../components/ui/tags/H.vue'
import { ref } from 'vue'
import { TimeEnum } from '../types/time-series'
import TimeSelector from '../components/ui/TimeSelector.vue'

const selectedTimeId = ref<TimeEnum>()
</script>

<style lang="postcss" scoped>
.events-weather-view {
   @apply flex flex-col gap-2;

   & .header-ct {
      @apply flex flex-col gap-2;
   }
}

@media (max-width: theme('screens.md')) {
   .events-weather-view {
   }
}
</style>
