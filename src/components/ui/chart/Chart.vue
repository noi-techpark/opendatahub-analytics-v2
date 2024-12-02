<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="chart-ct">
      <div class="chart-title">
         <P bold>{{ title }}</P>
         <P>{{ $t('common.updated-at', { time: updatedAt }) }}</P>
      </div>
      <div
         class="flex-grow"
         :style="plotHeight ? { height: `${plotHeight}px` } : undefined"
      >
         <Line :data="chartData" :options="chartOptions" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import type { ChartData } from 'chart.js'
import { computed } from 'vue'

import P from '../tags/P.vue'

import { useTimeSeriesStore } from '../../../stores/time-series'

const { timeSeriesList } = useTimeSeriesStore()

type Props = {
   title: string
   updatedAt: string
   plotHeight?: number
}
const props = withDefaults(defineProps<Props>(), {})

// TODO: chart data integration
const data = computed(() => {
   const dataObj: Record<string, number[]> = {}

   timeSeriesList.forEach((item) => {
      dataObj[item.id] = item.data
   })

   return dataObj
})

const dataFirstKey = computed(() => Object.keys(data.value)[0])

const chartData = computed(
   (): ChartData => ({
      labels: Array.from({
         length: data.value[dataFirstKey.value].length,
      }).fill(''),

      datasets: timeSeriesList.map((item) => ({
         data: item.data || [],
         borderColor: item.color,
         fill: false,
      })),
   })
)

const chartOptions = computed(() => ({
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
      legend: {
         display: false,
      },
      tooltip: {
         enabled: false,
      },
   },
   scales: {
      x: {
         display: true,
         grid: {
            color: '#D8DEE4',
         },
      },
      y: {
         display: false,
      },
   },
}))
</script>

<style lang="postcss" scoped>
.chart-ct {
   @apply flex flex-grow flex-col gap-2 rounded border px-4 py-2;
}

@media (max-width: theme('screens.md')) {
   .chart-ct {
   }
}
</style>
