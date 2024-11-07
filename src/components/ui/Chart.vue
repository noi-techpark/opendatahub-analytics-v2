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
      <div :style="plotHeight ? { height: `${plotHeight}px` } : undefined">
         <Line :data="chartData" :options="chartOptions" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import type { ChartData } from 'chart.js'
import { computed } from 'vue'
import P from './tags/P.vue'

type Props = {
   title: string
   updatedAt: string
   plotHeight?: number
}
const props = withDefaults(defineProps<Props>(), {})

const data = {
   v1: [43, 86, 16, 11, 30, 32],
   v2: [34, 56, 76, 44, 32, 22],
   v3: [43, 12, 44, 19, 97, 54],
}

const chartData = computed(
   (): ChartData => ({
      labels: Array.from({ length: data.v1.length }).fill(''),
      datasets: [
         {
            data: data?.v1 || [],
            fill: false,
            borderColor: '#FFBD00',
            tension: 0.3,
         },
         {
            data: data?.v2 || [],
            fill: false,
            borderColor: '#FF0000',
            tension: 0.3,
         },
         {
            data: data?.v3 || [],
            fill: false,
            borderColor: '#FF00BD',
            tension: 0.3,
         },
      ],
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
