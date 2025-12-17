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
      <div class="table-wrapper">
         <EventsTable :time-range="rangeForApi" />
      </div>
   </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import H from '../components/ui/tags/H.vue'
import TimeSelector from '../components/ui/TimeSelector.vue'
import { TimeEnum, TimeRange } from '../types/time-series'
import EventsTable from '../components/ui/event/EventsTable.vue'
import { startOfDay, subDays, subMonths } from 'date-fns'

const selectedTimeId = ref<TimeEnum>(TimeEnum.WEEK)
const rangeCustom = ref<TimeRange>()

const now = ref(new Date())

const selectedRange = computed(() => {
   const date = now.value

   switch (selectedTimeId.value) {
      case TimeEnum.WEEK:
         return {
            from: subDays(date, 7),
            to: date,
         }
      case TimeEnum.MONTH:
         return {
            from: subMonths(date, 1),
            to: date,
         }
      case TimeEnum.SIX_MONTHS:
         return {
            from: subMonths(date, 6),
            to: date,
         }
      case TimeEnum.CUSTOM:
         if (
            rangeCustom.value &&
            rangeCustom.value[0] &&
            rangeCustom.value[1]
         ) {
            return {
               from: rangeCustom.value[0],
               to: rangeCustom.value[1],
            }
         }
         return {
            from: date,
            to: date,
         }

      default: // DAY
         return {
            from: startOfDay(date),
            to: date,
         }
   }
})

const rangeForApi = computed<TimeRange>(() => [
   selectedRange.value.from,
   selectedRange.value.to,
])
</script>

<style lang="postcss" scoped>
.events-view {
   @apply flex h-full w-full flex-col;

   & .header-ct {
      @apply mb-6 flex flex-col gap-2;
   }

   & .table-wrapper {
      @apply min-h-0 w-full flex-1;
   }
}
</style>
