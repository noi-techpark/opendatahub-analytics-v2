<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="charts-view">
      <div class="chart-title">
         <H tag="h1">{{ t('views.charts.title') }}</H>
         <P>
            {{
               t('common.updated-at', {
                  time: updatedAt,
               })
            }}
         </P>
      </div>

      <div class="chart-content-ct">
         <div class="chart-content">
            <div class="chart-control">
               <TimeSelector
                  v-model="selectedTimeId"
                  v-model:range="rangeCustom"
               />

               <div class="chart-hint">
                  <TooltipCustom>
                     <template #default>
                        <InfoIcon class="info-icon" />
                     </template>
                     <template #container>
                        <div class="info-content">
                           <i18n-t tag="p" keypath="views.charts.tooltip.zoom">
                              <template #shift>
                                 <span>Shift</span>
                              </template>
                           </i18n-t>
                           <p>{{ t('views.charts.tooltip.pan') }}</p>
                        </div>
                     </template>
                  </TooltipCustom>

                  <SelectPopover
                     v-model="selectedPlotHeight"
                     :text="
                        t('views.charts.plot-height', {
                           value: selectedPlotHeight
                              ? selectedPlotHeight + 'px'
                              : t('common.auto'),
                        })
                     "
                     :options="plotHeights"
                     type="list"
                  />
                  <SelectPopover
                     v-model="axisPosition"
                     :text="
                        t('views.charts.y-axis-position', {
                           position: axisPositionOptions.find(
                              (option) => option.value === axisPosition
                           )?.label,
                        })
                     "
                     :options="axisPositionOptions"
                     type="list"
                  />
               </div>
            </div>
            <Chart
               v-if="timeSeriesList.length"
               :key="`chart_${selectedPlotHeight}`"
               ref="chartEl"
               :title="t('views.charts.timeseries-data')"
               :updatedAt="updatedAt"
               :plotHeight="selectedPlotHeight"
               :loading="loading"
               :axis-position="axisPosition"
            />
            <P v-else bold large class="pt-4">{{
               t('views.charts-add-edit.no-time-series')
            }}</P>
         </div>

         <div class="chart-side">
            <div class="card">
               <P bold>{{ t('views.charts.export.title') }}</P>
               <Button
                  secondary
                  :value="t('views.charts.export.xls')"
                  @click="onExportAsXLS()"
               >
                  <DownloadIcon />
               </Button>
               <Button
                  secondary
                  :value="t('views.charts.export.csv')"
                  @click="onExportAsCSV()"
               >
                  <DownloadIcon />
               </Button>
               <Button
                  secondary
                  :value="t('views.charts.export.image')"
                  @click="onExportAsImage()"
               >
                  <DownloadIcon />
               </Button>
            </div>

            <div v-if="!isEmbedMode" class="card">
               <IconText
                  class="justify-between"
                  bold
                  :text="t('views.charts.embed')"
                  reverse
                  no-padding
                  :hover="false"
                  :clickable="false"
               >
                  <IconCheck
                     class="action-icon"
                     :class="{
                        'icon-hidden': !copied,
                     }"
                  />
                  <ContentCopyIcon
                     class="action-icon __clickable"
                     :class="{ 'icon-hidden': copied }"
                     @click="onCopy()"
                  />
               </IconText>
               <P class="card-content"
                  ><span class="line-clamp-3">{{ embeddableCode }}</span></P
               >
            </div>

            <Button
               v-if="!isEmbedMode"
               center
               :value="t('views.charts.save')"
               :class="{ 'pointer-events-none': configurationSaved }"
               @click="onSaveConfiguration()"
            >
               <IconCheck
                  class="action-icon"
                  :class="{
                     'icon-hidden': !configurationSaved,
                  }"
               />
               <SaveIcon
                  class="action-icon __clickable"
                  :class="{ 'icon-hidden': configurationSaved }"
               />
            </Button>
         </div>
      </div>
   </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import { computed, onMounted, ref, watch } from 'vue'
import DownloadIcon from '../components/ui/svg/DownloadIcon.vue'
import Button from '../components/ui/Button.vue'
import SaveIcon from '../components/ui/svg/SaveIcon.vue'
import IconText from '../components/ui/IconText.vue'
import ContentCopyIcon from '../components/ui/svg/ContentCopyIcon.vue'
import Chart from '../components/ui/chart/Chart.vue'

import { startOfDay, subDays, subMonths, isToday } from 'date-fns'
import { useTimeSeriesStore } from '../stores/time-series'
import { useAutoRefreshStore } from '../stores/auto-refresh'
import { useClipboard } from '@vueuse/core'
import { useFetchWithAuth } from '../utils/api'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import IconCheck from '../components/ui/svg/IconCheck.vue'
import { randomId } from '../components/utils/useRandomId'
import { useRoute } from 'vue-router'
import TimeSelector from '../components/ui/TimeSelector.vue'
import { TimeEnum, TimeRange, TimeSeries } from '../types/time-series'

import XLSX from 'xlsx'
import { getReadableDateWithTime } from '../utils/date-utils'
import { storeToRefs } from 'pinia'
import TooltipCustom from '../components/ui/tooltip/TooltipCustom.vue'
import InfoIcon from '../components/ui/svg/InfoIcon.vue'

const { t } = useI18n()
const route = useRoute()
const {
   getTimeSeriesForEmbedCode,
   embeddableKeys,
   addTimeSeries,
   getBaseTimeSeriesObj,
} = useTimeSeriesStore()

const { hasToLoad, timeSeriesList } = storeToRefs(useTimeSeriesStore())
const autoRefreshStore = useAutoRefreshStore()

const { copy, copied } = useClipboard()

const chartEl = ref()
const lastUpdateOn = ref(new Date())
const isEmbedMode = computed(() => route.query.viewMode === 'embed')
const LOCAL_STORAGE_CONFIG_KEY = 'savedChartConfiguration'

const loading = ref(false)
const configurationSaved = ref(false)
const axisPosition = ref<'default' | 'all-left' | 'all-right'>('default')

const axisPositionOptions = computed(() => [
   { label: t('common.default'), value: 'default' },
   { label: t('common.all-left'), value: 'all-left' },
   { label: t('common.all-right'), value: 'all-right' },
])

const selectedTimeId = ref<TimeEnum>(TimeEnum.DAY)
const rangeCustom = ref<TimeRange>([new Date(), new Date()])

const now = ref(new Date())

const selectedPlotHeight = ref<number>(0)

const updatedAt = computed(() => {
   return getReadableDateWithTime(lastUpdateOn.value)
})

const embeddableCode = computed(() => {
   return `${window.location.origin}/charts${queryStringToEmbed.value ? '?' + queryStringToEmbed.value : ''}`
})

const queryStringToEmbed = computed(() => {
   const seriesToEmbed = getTimeSeriesForEmbedCode()

   if (!seriesToEmbed.length) return ''

   return `viewMode=embed&from=${selectedTime.value.from.toJSON()}&to=${selectedTime.value.to.toJSON()}&selectedYAxis=${axisPosition.value}&selectedTimeId=${selectedTimeId.value}&${getTimeSeriesForEmbedCode().join('&')}`
})

const plotHeights = computed(() => [
   { label: t('common.auto'), value: 0 },
   { label: '500px', value: 500 },
   { label: '700px', value: 700 },
])

const selectedTime = computed(() => {
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
         return {
            from: rangeCustom.value[0],
            to: rangeCustom.value[1],
         }

      default: // DAY
         return {
            from: startOfDay(date),
            to: date,
         }
   }
})

const getTimeseriesData = async () => {
   loading.value = true

   const from = selectedTime.value.from.toJSON()
   const to = selectedTime.value.to.toJSON()

   for (const element of timeSeriesList.value) {
      const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${encodeURIComponent(element.dataset)}/${encodeURIComponent(element.datatype)}/${from}/${to}?limit=-1&offset=0&select=mvalue,mvalidtime,mperiod&where=sname.eq.${encodeURIComponent(element.station)},sorigin.eq.${encodeURIComponent(element.provider)},mperiod.eq.${element.period},sactive.eq.true&shownull=false&distinct=true`
      const { data } = await useFetchWithAuth(dataUrl).json()
      const labels = []
      const values = []

      for (const element of (data.value || { data: [] }).data) {
         values.push(element.mvalue)
         labels.push(element.mvalidtime)
      }

      element.data = values
      element.labels = labels
   }

   lastUpdateOn.value = new Date()

   hasToLoad.value = false
   loading.value = false
}

const onExportAsXLS = () => {
   const chartData = chartEl.value.chart.chart.data

   const workbook = XLSX.utils.book_new()

   chartData.datasets.forEach(
      (chartDataset: Record<string, any>, index: number) => {
         const exportData = [
            ['Datetime', 'Value'],
            ...chartDataset.data.map((label: string, i: number) => [
               timeSeriesList.value[index].labels[i],
               chartDataset.data[i],
            ]),
         ]

         const worksheet = XLSX.utils.aoa_to_sheet(exportData)

         const { id, provider, dataset, station, datatype } =
            timeSeriesList.value[index]

         const sheetName = `${provider}_${dataset}_${station}_${datatype}`
         XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `${sheetName.slice(0, 26)}_${id.slice(0, 4)}`
         )
      }
   )

   XLSX.writeFile(workbook, `chart-data-${new Date().getTime()}.xlsx`)
}

const onExportAsCSV = () => {
   const chartData = chartEl.value.chart.chart.data
   const currentDate = new Date().getTime()

   chartData.datasets.forEach(
      (chartDataset: Record<string, any>, index: number) => {
         let csvContent = 'Datetime,Value\n'

         chartDataset.data.forEach((value: any, i: number) => {
            const timestamp = timeSeriesList.value[index].labels[i]
            csvContent += `${timestamp},${value}\n`
         })

         const { id, provider, dataset, station, datatype } =
            timeSeriesList.value[index]
         const fileName = `${provider}_${dataset}_${station}_${datatype}_${currentDate}.csv`

         setTimeout(() => {
            const blob = new Blob([csvContent], {
               type: 'text/csv;charset=utf-8;',
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', fileName)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()

            setTimeout(() => {
               document.body.removeChild(link)
               URL.revokeObjectURL(url)
            }, 100)
         }, index * 300)
      }
   )
}

const onExportAsImage = () => {
   const a = document.createElement('a')
   a.href = chartEl.value.chart.chart.toBase64Image()
   a.download = `export-${new Date().toJSON()}.png`

   a.click()
}

const onCopy = () => {
   copy(embeddableCode.value)
}

const getConfigFromLocalStorage = () => {
   const params = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY)
      ? new URLSearchParams(
           new URL(
              `${window.origin}?${localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY)}`
           ).search
        )
      : undefined

   if (!params) return params

   const obj: Record<string, string> = {}

   params.forEach((value, key) => {
      if (params.get(key)) {
         obj[key] = params.get(key) || ''
      }
   })

   return obj
}

const setSavedTimeseries = async () => {
   const query = route.query

   const configToLoad = getConfigFromLocalStorage() || query

   if (!configToLoad.selectedTimeId || timeSeriesList.value.length)
      return { hasLoadedNewData: false }

   const data: Partial<TimeSeries>[] = []

   for (const key of Object.keys(configToLoad)) {
      if (embeddableKeys.findIndex((item) => key.startsWith(item)) === -1) {
         continue
      }

      const indexSeparatorIndex = key.lastIndexOf('_')

      const index = key.slice(indexSeparatorIndex + 1)

      if (index === undefined) {
         return { hasLoadedNewData: false }
      }

      const timeSeriesKey = key.slice(
         0,
         indexSeparatorIndex
      ) as keyof TimeSeries

      ;(data[+index] ??= getBaseTimeSeriesObj())[timeSeriesKey] = configToLoad[
         key
      ] as string & number[]
   }

   for (const item of data) {
      if (timeSeriesList.value.find((el) => el.id === item.id)) continue

      addTimeSeries({ id: randomId(), data: [], ...item } as TimeSeries)
   }

   const hasLoadedNewData = selectedTimeId.value !== configToLoad.selectedTimeId // triggers selectedTime watch

   if (configToLoad.selectedTimeId === TimeEnum.CUSTOM) {
      rangeCustom.value = [
         new Date(configToLoad.from?.toString() || ''),
         new Date(configToLoad.to?.toString() || ''),
      ]
   }

   if (configToLoad.selectedYAxis) {
      axisPosition.value = configToLoad.selectedYAxis as
         | 'default'
         | 'all-left'
         | 'all-right'
   }

   selectedTimeId.value = configToLoad.selectedTimeId as TimeEnum

   return { hasLoadedNewData }
}

const onSaveConfiguration = () => {
   localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, queryStringToEmbed.value)
   configurationSaved.value = true

   setTimeout(() => {
      configurationSaved.value = false
   }, 2000)
}

const setRangeFromQueryParams = () => {
   const query = route.query

   if (!query.from || !query.to) return

   rangeCustom.value = [new Date(query.from), new Date(query.to)]
   selectedTimeId.value = TimeEnum.CUSTOM
}

watch(selectedTime, (newVal) => {
   getTimeseriesData()
})

watch(
   () => timeSeriesList.value.length,
   (newVal) => {
      if (!newVal) return

      getTimeseriesData()
   }
)

// Watch for auto-refresh changes and only refresh if selected end date is today
watch(
   () => autoRefreshStore.lastRefreshTime,
   (newTime) => {
      if (newTime && timeSeriesList.value.length > 0) {
         if (isToday(selectedTime.value.to)) {
            now.value = new Date()
            getTimeseriesData()
         }
      }
   }
)

onMounted(async () => {
   const { hasLoadedNewData } = await setSavedTimeseries()

   if (!hasLoadedNewData) {
      setRangeFromQueryParams()
      getTimeseriesData()
   }
})
</script>

<style lang="postcss" scoped>
.charts-view {
   @apply flex flex-col gap-2;

   & .chart-content-ct {
      @apply flex justify-between gap-6;

      & .chart-content {
         @apply flex flex-shrink flex-grow flex-col gap-2;

         & .chart-control {
            @apply flex justify-between gap-6;

            & .chart-hint {
               @apply flex items-center gap-2;

               & .info-icon {
                  @apply h-5 cursor-help text-green;
               }

               & .info-content {
                  @apply text-sm text-grey-3;

                  & span {
                     @apply font-semibold;
                  }
               }
            }
         }
      }

      & .chart-side {
         @apply flex flex-col gap-4;

         & .card {
            @apply flex w-[300px] flex-col gap-3 rounded border p-4;

            & .card-content {
               @apply break-words text-xs text-green underline;
            }
         }

         & .action-icon {
            @apply transition-all;

            &.icon-hidden {
               @apply pointer-events-none absolute opacity-0;
            }
         }
      }
   }
}

@media (max-width: theme('screens.md')) {
   .charts-view {
      @apply px-2;

      & .chart-content-ct {
         @apply flex-col;

         & .chart-content {
            @apply w-full;

            & .chart-control {
               @apply flex-col;
            }
         }

         & .chart-side {
            @apply w-full;

            & .card {
               @apply w-full;
            }
         }
      }
   }
}
</style>
