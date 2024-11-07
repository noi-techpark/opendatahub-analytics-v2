<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-charts-content">
      <RouterLink to="/charts/add">
         <Button :value="$t('components.sidebar-charts-content.add')">
            <AddIcon />
         </Button>
      </RouterLink>

      <div class="time-series-ct">
         <TimeSeriesCard
            :timeSeries="{
               displayName: 'Weather, Mila, Air Temperature Max, 600s',
               color: '#FFC000',
               dataset: 'Weather',
               station: 'Mila',
               datatype: 'Air temperature MAX',
               period: '600s',
            }"
         />
         <TimeSeriesCard
            :timeSeries="{
               displayName: 'Weather, Mila, Air Temperature Max, 600s',
               color: '#FF0000',
               dataset: 'Weather',
               station: 'Mila',
               datatype: 'Air temperature MAX',
               period: '600s',
            }"
         />
         <TimeSeriesCard
            :timeSeries="{
               displayName: 'Weather, Mila, Air Temperature Max, 600s',
               color: '#50742F',
               dataset: 'Weather',
               station: 'Mila',
               datatype: 'Air temperature MAX',
               period: '600s',
            }"
         />
      </div>
   </div>
</template>

<script lang="ts" setup>
import Button from '../ui/Button.vue'
import TimeSeriesCard from '../ui/chart/TimeSeriesCard.vue'
import AddIcon from '../ui/svg/AddIcon.vue'

type Props = {}
const props = withDefaults(defineProps<Props>(), {})
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
