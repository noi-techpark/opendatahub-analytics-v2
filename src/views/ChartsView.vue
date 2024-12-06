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
            </div>
            <Chart
               v-if="timeSeriesList.length"
               :key="`chart_${selectedPlotHeight}`"
               ref="chartEl"
               :title="t('views.charts.timeseries-data')"
               :updatedAt="updatedAt"
               :plotHeight="selectedPlotHeight"
            />
         </div>

         <div class="chart-side">
            <div class="card">
               <P bold>{{ t('views.charts.export.title') }}</P>
               <Button secondary :value="t('views.charts.export.xls')">
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

            <div class="card">
               <IconText
                  class="justify-between"
                  bold
                  :text="t('views.charts.embed')"
                  reverse
                  noPadding
                  :hover="false"
               >
                  <IconCheck
                     class="transition-all"
                     :class="{
                        'pointer-events-none absolute opacity-0': !copied,
                     }"
                  />
                  <ContentCopyIcon
                     class="transition-all"
                     :class="{ 'absolute opacity-0': copied }"
                     @click="onCopy()"
                  />
               </IconText>
               <P class="card-content">{{ embeddableCode }}</P>
            </div>

            <Button
               center
               :value="t('views.charts.save')"
               @click="onSaveConfiguration()"
            >
               <SaveIcon />
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

import { startOfDay, subDays, subMonths } from 'date-fns'
import { useTimeSeriesStore } from '../stores/time-series'
import { useClipboard, useFetch, useNavigatorLanguage } from '@vueuse/core'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import IconCheck from '../components/ui/svg/IconCheck.vue'
import { randomId } from '../components/utils/useRandomId'
import { useRoute } from 'vue-router'
import TimeSelector from '../components/ui/TimeSelector.vue'
import { TimeEnum, TimeRange, TimeSeries } from '../types/time-series'

const { t } = useI18n()
const {
   timeSeriesList,
   getTimeSeriesForEmbedCode,
   embeddableKeys,
   addTimeSeries,
   getBaseTimeSeriesObj,
} = useTimeSeriesStore()

const { language } = useNavigatorLanguage()

const { copy, copied } = useClipboard()

const chartEl = ref()
const lastUpdateOn = ref(new Date())

const LOCAL_STORAGE_CONFIG_KEY = 'savedChartConfiguration'

const loading = ref(false)

const selectedTimeId = ref<TimeEnum>()
const rangeCustom = ref<TimeRange>([new Date(), new Date()])

const selectedPlotHeight = ref<number>(0)

const updatedAt = computed(() => {
   return lastUpdateOn.value.toLocaleString(language.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
   })
})

const embeddableCode = computed(() => {
   return `${window.location.origin}/charts?${queryStringToEmbed.value}`
})

const queryStringToEmbed = computed(() => {
   return `selectedTimeId=${selectedTimeId.value}&${getTimeSeriesForEmbedCode().join('&')}`
})

const plotHeights = computed(() => [
   { label: t('common.auto'), value: 0 },
   { label: '500px', value: 500 },
])

const selectedTime = computed(() => {
   const date = new Date()

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
   // https://mobility.api.opendatahub.com/v2/flat/ParkingStation%2CParkingSensor%2CParkingFacility/free/2024-11-09T23:00:00.000Z/2024-11-10T23:00:00.000Z?limit=-1&distinct=true&select=mvalue,mvalidtime,mperiod&where=scode.eq.%22103%22,mperiod.eq.300,sactive.eq.true
   for (const element of timeSeriesList) {
      const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${encodeURIComponent(element.dataset)}/${encodeURIComponent(element.datatype)}/${from}/${to}?limit=-1&offset=0&select=mvalue,mvalidtime,mperiod&where=sname.eq.${encodeURIComponent(element.station)},sorigin.eq.${encodeURIComponent(element.provider)},mperiod.eq.${element.period},sactive.eq.true&shownull=false&distinct=true`
      const { data } = await useFetch(dataUrl).json()

      element.data = (data.value || { data: [] }).data.map(
         (item: { mvalue: number }) => item.mvalue
      )
   }

   lastUpdateOn.value = new Date()
   loading.value = false
}

const onExportAsImage = () => {
   const a = document.createElement('a')
   a.href = chartEl.value.chart.chart.toBase64Image()
   a.download = `export_${new Date().toJSON()}.png`

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

const setSavedTimeseries = () => {
   const { query } = useRoute()

   const configToLoad = getConfigFromLocalStorage() || query

   console.log(configToLoad)

   if (!configToLoad.selectedTimeId) return

   const data: Partial<TimeSeries>[] = []

   console.log({ configToLoad })

   for (const key of Object.keys(configToLoad)) {
      if (embeddableKeys.findIndex((item) => key.startsWith(item)) === -1) {
         continue
      }

      const indexSeparatorIndex = key.lastIndexOf('_')

      const index = key.slice(indexSeparatorIndex + 1)

      if (index === undefined) {
         return
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
      addTimeSeries({ id: randomId(), data: [], ...item } as TimeSeries)
   }

   const hasToLoad = selectedTimeId.value === configToLoad.selectedTimeId
   selectedTimeId.value = configToLoad.selectedTimeId as TimeEnum

   if (hasToLoad) {
      getTimeseriesData()
   }
}

const onSaveRangeCustom = () => {
   selectedTimeId.value = TimeEnum.CUSTOM
}

const onSaveConfiguration = () => {
   localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, queryStringToEmbed.value)
}

watch(selectedTime, (newVal) => {
   getTimeseriesData()
})

onMounted(() => {
   setSavedTimeseries()
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
      }
   }
}

@media (max-width: theme('screens.md')) {
   .charts-view {
   }
}
</style>
