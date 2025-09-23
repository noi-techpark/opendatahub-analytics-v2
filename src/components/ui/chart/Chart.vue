<template>
   <div class="chart-ct">
      <Loader :active="!!loading" />

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
// Augment Chart.js types for custom plugins
declare module 'chart.js' {
   interface PluginOptionsByType<TType extends ChartType> {
      background?: {
         color?: string
      }
      // If you have other custom plugins with options, declare them here too
   }
}

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
   type ChartOptions,
   type ChartType,
} from 'chart.js'
import { computed, ref } from 'vue'
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
      const active = (chart as any).getActiveElements?.()
      if (active && active.length) {
         const ctx = chart.ctx
         const activePoint = active[0]
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
   axisPosition?: 'default' | 'all-left' | 'all-right'
}
const props = withDefaults(defineProps<Props>(), {
   axisPosition: 'default',
})

const chart = ref()

const chartData = computed(() => {
   const labels = timeSeriesList[0]?.labels?.map((item) =>
      getReadableDateWithTime(new Date(item))
   )

   const datasets = timeSeriesList.map((item, index) => {
      // Default alternating behavior for default mode
      let yAxisID = index % 2 === 0 ? 'y' : 'y1'

      // For 'all-left' and 'all-right' modes, all datasets use the same axis
      if (props.axisPosition === 'all-left') {
         // For 'all-left', all datasets use the 'y' scale (left side)
         yAxisID = 'y'
      } else if (props.axisPosition === 'all-right') {
         // For 'all-right', all datasets use the 'y1' scale (right side)
         yAxisID = 'y1'
      }

      // Create a display label from available properties
      const displayLabel = `${item.station} - ${item.datatype}`

      return {
         label: displayLabel,
         data: item.data,
         borderColor: item.color,
         fill: false,
         pointRadius: 1.5,
         pointHoverRadius: 1,
         yAxisID: yAxisID,
      }
   })

   return { labels, datasets }
})

const chartOptions = computed((): ChartOptions<'line'> => {
   // Determine if we should show both scales or just one
   const showBothScales = props.axisPosition === 'default'

   // Find which dataset has the largest values for scale configuration
   let largerDatasetIndex = 0
   if (timeSeriesList.length > 1) {
      // Get max values from all datasets
      const maxValues = timeSeriesList.map((series) =>
         Math.max(...series.data.filter((n) => !isNaN(n) && n !== null), 0)
      )

      // Find which dataset has the largest values
      largerDatasetIndex = maxValues.indexOf(Math.max(...maxValues))
   }

   const yAxisColor = timeSeriesList[0]?.color || '#000'
   const y1AxisColor =
      timeSeriesList.length > 1 ? timeSeriesList[1]?.color || '#000' : '#000'

   const yAxisLabel = timeSeriesList[0]
      ? `${timeSeriesList[0].station} - ${timeSeriesList[0].datatype}`
      : ''
   const y1AxisLabel =
      timeSeriesList.length > 1
         ? `${timeSeriesList[1].station} - ${timeSeriesList[1].datatype}`
         : ''

   // For single-side modes, we'll use the color and label of the dataset with larger values
   let leftAxisColor = yAxisColor
   let leftAxisLabel = yAxisLabel
   let rightAxisColor = y1AxisColor
   let rightAxisLabel = y1AxisLabel

   // If the second dataset has larger values, use its color and label for the left axis in 'all-left' mode
   if (largerDatasetIndex === 1 && timeSeriesList.length > 1) {
      leftAxisColor = y1AxisColor
      leftAxisLabel = y1AxisLabel
   }

   // If the first dataset has larger values, use its color and label for the right axis in 'all-right' mode
   if (largerDatasetIndex === 0 && timeSeriesList.length > 1) {
      rightAxisColor = yAxisColor
      rightAxisLabel = yAxisLabel
   }

   // For single-side modes, determine which scale to show
   let scaleToShow = 'y' // Default to first scale

   // For single-side modes, determine which scale to show
   if (props.axisPosition === 'all-left') {
      // For 'all-left', we'll use the y scale (left side)
      scaleToShow = 'y'
   } else if (props.axisPosition === 'all-right') {
      // For 'all-right', we'll use the y1 scale (right side)
      scaleToShow = 'y1'
   }

   return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
               usePointStyle: true,
               boxWidth: 6,
               boxHeight: 6,
               padding: 15,
               color: '#333',
               font: {
                  size: 12,
               },
            },
         },
         tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
               title: (tooltipItems) => {
                  return tooltipItems[0].label || ''
               },
               label: (context) => {
                  const dataset = timeSeriesList[context.datasetIndex]
                  const displayLabel = `${dataset.station} - ${dataset.datatype}`
                  const value = context.raw !== null ? context.raw : 'N/A'
                  return `${displayLabel}: ${value}`
               },
            },
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
            type: 'linear',
            display: showBothScales || scaleToShow === 'y',
            position: props.axisPosition === 'all-right' ? 'right' : 'left',
            grid: {
               color: '#D8DEE4',
            },
            ticks: {
               color:
                  props.axisPosition === 'all-left'
                     ? leftAxisColor
                     : yAxisColor,
            },
            title: {
               display: timeSeriesList.length > 1,
               text:
                  props.axisPosition === 'all-left'
                     ? leftAxisLabel
                     : yAxisLabel,
               color:
                  props.axisPosition === 'all-left'
                     ? leftAxisColor
                     : yAxisColor,
            },
            beginAtZero: false,
            suggestedMin:
               props.axisPosition === 'all-left' &&
               largerDatasetIndex === 1 &&
               timeSeriesList.length > 1
                  ? Math.min(
                       ...timeSeriesList[1].data.filter(
                          (n) => !isNaN(n) && n !== null
                       )
                    )
                  : undefined,
            suggestedMax:
               props.axisPosition === 'all-left' &&
               largerDatasetIndex === 1 &&
               timeSeriesList.length > 1
                  ? Math.max(
                       ...timeSeriesList[1].data.filter(
                          (n) => !isNaN(n) && n !== null
                       )
                    )
                  : undefined,
         },
         y1: {
            type: 'linear',
            display:
               (showBothScales || scaleToShow === 'y1') &&
               timeSeriesList.length > 1,
            position:
               props.axisPosition !== 'default'
                  ? props.axisPosition === 'all-right'
                     ? 'right'
                     : 'left'
                  : 'right',
            offset: props.axisPosition !== 'default',
            grid: {
               drawOnChartArea:
                  props.axisPosition === 'all-right' ||
                  (props.axisPosition === 'default' &&
                     timeSeriesList.some((_, index) => index % 2 !== 0)),
            },
            ticks: {
               color:
                  props.axisPosition === 'all-right'
                     ? rightAxisColor
                     : y1AxisColor,
            },
            title: {
               display: timeSeriesList.length > 1,
               text:
                  props.axisPosition === 'all-right'
                     ? rightAxisLabel
                     : y1AxisLabel,
               color:
                  props.axisPosition === 'all-right'
                     ? rightAxisColor
                     : y1AxisColor,
            },
            beginAtZero: false,
            suggestedMin:
               props.axisPosition === 'all-right' &&
               largerDatasetIndex === 0 &&
               timeSeriesList.length > 1
                  ? Math.min(
                       ...timeSeriesList[0].data.filter(
                          (n) => !isNaN(n) && n !== null
                       )
                    )
                  : undefined,
            suggestedMax:
               props.axisPosition === 'all-right' &&
               largerDatasetIndex === 0 &&
               timeSeriesList.length > 1
                  ? Math.max(
                       ...timeSeriesList[0].data.filter(
                          (n) => !isNaN(n) && n !== null
                       )
                    )
                  : undefined,
         },
      },
   }
})

defineExpose({ chart })
</script>

<style lang="postcss" scoped>
.chart-ct {
   @apply relative flex flex-grow flex-col gap-2 rounded border px-4 py-2;
}

/* Responsive styles for mobile devices */
@media (max-width: theme('screens.md')) {
   .chart-ct {
      @apply px-2 py-1;
   }
}
</style>
