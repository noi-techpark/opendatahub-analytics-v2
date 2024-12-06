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
         <Line ref="chart" :data="chartData" :options="chartOptions" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import {
   Chart as ChartJS,
   Title,
   Tooltip,
   Legend,
   LineElement,
   CategoryScale,
   LinearScale,
   PointElement,
} from 'chart.js'
import { computed, onMounted, ref } from 'vue'
import P from '../tags/P.vue'
import { useTimeSeriesStore } from '../../../stores/time-series'
import { getReadableDateWithTime } from '../../../utils/date-utils'

// Register required Chart.js components
ChartJS.register(
   Title,
   Tooltip,
   Legend,
   LineElement,
   CategoryScale,
   LinearScale,
   PointElement
)

// Register the background plugin globally
ChartJS.register({
   id: 'background',
   beforeDraw: (chart) => {
      const ctx = chart.ctx
      const { width, height } = chart
      const bgColor = chart.options.plugins?.background?.color || 'transparent'

      ctx.save()
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
   },
})

const { timeSeriesList } = useTimeSeriesStore()

type Props = {
   title: string
   updatedAt: string
   plotHeight?: number
}
const props = withDefaults(defineProps<Props>(), {})

const chart = ref()

const chartData = computed(() => ({
   labels: timeSeriesList[0]?.labels?.map((item) =>
      getReadableDateWithTime(new Date(item))
   ),
   datasets: timeSeriesList.map((item) => ({
      label: item.name,
      data: item.data,
      borderColor: item.color,
      fill: false,
   })),
}))

const chartOptions = computed(() => ({
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
      legend: {
         display: false,
      },
      tooltip: {
         enabled: true,
      },
      background: {
         color: '#fff', // Set white background
      },
   },
   scales: {
      x: {
         grid: {
            color: '#D8DEE4',
         },
      },
      y: {
         display: true,
      },
   },
}))

defineExpose({ chart })
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
