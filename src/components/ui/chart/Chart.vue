<template>
   <div class="chart-ct">
      <Loader :active="loading" />

      <div class="chart-title">
         <P bold>{{ title }}</P>
         <P>{{ $t('common.updated-at', { time: updatedAt }) }}</P>
      </div>

      <div class="flex-grow" :style="{ height: `${plotHeight || 350}px` }">
         <Line ref="chart" :data="chartData" :options="chartOptions" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'
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
import Loader from '../Loader.vue'

ChartJS.register(
   Title,
   Tooltip,
   Legend,
   LineElement,
   CategoryScale,
   LinearScale,
   PointElement
)

ChartJS.register(zoomPlugin)

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
   loading?: boolean
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
      zoom: {
         zoom: {
            wheel: {
               enabled: true,
            },
            drag: {
               enabled: true,
               backgroundColor: 'rgba(0, 123, 255, 0.3)',
               modifierKey: 'shift',
            },
            mode: 'x',
         },
         pan: {
            enabled: true,
            mode: 'x',
         },
         limits: {
            x: { min: 'original', max: 'original' },
            y: { min: 'original', max: 'original' },
         },
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
   @apply relative flex flex-grow flex-col gap-2 rounded border px-4 py-2;
}

@media (max-width: theme('screens.md')) {
   .chart-ct {
   }
}
</style>
