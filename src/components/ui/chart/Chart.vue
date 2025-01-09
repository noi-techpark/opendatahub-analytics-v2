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

ChartJS.register(
   Title,
   Tooltip,
   Legend,
   LineElement,
   CategoryScale,
   LinearScale,
   PointElement
)

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

ChartJS.register({
   id: 'verticalLine',
   afterDraw: (chart) => {
      if (chart.tooltip?._active && chart.tooltip._active.length) {
         const ctx = chart.ctx
         const activePoint = chart.tooltip._active[0]
         const x = activePoint.element.x
         const topY = chart.scales.y.top
         const bottomY = chart.scales.y.bottom

         ctx.save()
         ctx.beginPath()
         ctx.moveTo(x, topY)
         ctx.lineTo(x, bottomY)
         ctx.lineWidth = 1
         ctx.strokeStyle = '#50742F'
         ctx.stroke()
         ctx.restore()
      }
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
      pointRadius: 1.5,
      pointHoverRadius: 1,
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
         mode: 'index',
         intersect: false,
      },
      background: {
         color: '#fff',
      },
   },
   interaction: {
      mode: 'index',
      intersect: false,
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
