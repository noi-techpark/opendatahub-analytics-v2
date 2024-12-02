<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-charts-content">
      <RouterLink to="/charts/add">
         <Button grow :value="$t('components.sidebar-charts-content.add')">
            <AddIcon />
         </Button>
      </RouterLink>

      <div class="time-series-ct">
         <TimeSeriesCard v-for="item in timeSeriesList" :timeSeries="item" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import Button from '../ui/Button.vue'
import TimeSeriesCard from '../ui/chart/TimeSeriesCard.vue'
import AddIcon from '../ui/svg/AddIcon.vue'
import { useTimeSeriesStore } from '../../stores/time-series'

const { timeSeriesList } = useTimeSeriesStore()
</script>

<style lang="postcss" scoped>
.sidebar-charts-content {
   @apply flex flex-col gap-2 px-3;

   & .time-series-ct {
      @apply flex flex-col gap-2;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-charts-content {
   }
}
</style>
