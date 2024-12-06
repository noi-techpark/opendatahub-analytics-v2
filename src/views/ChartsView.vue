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
               <div class="chart-time-ct">
                  <MenuButtons :links :selected-id="selectedTimeId" />
                  <RangeDatePicker
                     :text="t('views.charts.time.custom')"
                     v-model="rangeCustom"
                     :selected="selectedTimeId === filtersTimeEnum.CUSTOM"
                     @save="onSaveRangeCustom()"
                  ></RangeDatePicker>
               </div>

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

            <Button center :value="t('views.charts.save')">
               <SaveIcon />
            </Button>
         </div>
      </div>
   </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MenuButtons from '../components/ui/MenuButtons.vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import { computed, onMounted, ref, watch } from 'vue'
import DownloadIcon from '../components/ui/svg/DownloadIcon.vue'
import Button from '../components/ui/Button.vue'
import SaveIcon from '../components/ui/svg/SaveIcon.vue'
import IconText from '../components/ui/IconText.vue'
import ContentCopyIcon from '../components/ui/svg/ContentCopyIcon.vue'
import Chart from '../components/ui/chart/Chart.vue'
import Select from '../components/ui/Select.vue'

import { startOfDay, subDays, subMonths } from 'date-fns'
import { useTimeSeriesStore } from '../stores/time-series'
import { useClipboard, useFetch } from '@vueuse/core'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import IconCheck from '../components/ui/svg/IconCheck.vue'
import { randomId } from '../components/utils/useRandomId'
import { useRoute } from 'vue-router'
import RangeDatePicker from '../components/ui/input/RangeDatePicker.vue'

const { t } = useI18n()
const { timeSeriesList, getTimeSeriesForEmbedCode } = useTimeSeriesStore()

const { copy, copied } = useClipboard()

const chartEl = ref()

enum filtersTimeEnum {
   DAY = 'DAY',
   WEEK = 'WEEK',
   MONTH = 'MONTH',
   SIX_MONTHS = '6_MONTHS',
   CUSTOM = 'CUSTOM',
}

const loading = ref(false)

const rangeCustom = ref([new Date(), new Date()])

const selectedTimeId = ref<filtersTimeEnum>(filtersTimeEnum.DAY)
const selectedPlotHeight = ref<number>(0)
const updatedAt = new Date().toISOString()

const randomDivider = computed(() => {
   return `_${randomId().slice(0, 5)}_`
})

const embeddableCode = computed(() => {
   return `${window.location.origin}/charts?divider=${randomDivider.value}&${getTimeSeriesForEmbedCode().join(randomDivider.value)}`
})

const plotHeights = computed(() => [
   { label: t('common.auto'), value: 0 },
   { label: '500px', value: 500 },
])

const links = computed(() => [
   {
      id: filtersTimeEnum.DAY,
      title: t('views.charts.time.day'),
      action: () => (selectedTimeId.value = filtersTimeEnum.DAY),
   },
   {
      id: filtersTimeEnum.WEEK,
      title: t('views.charts.time.week'),
      action: () => (selectedTimeId.value = filtersTimeEnum.WEEK),
   },
   {
      id: filtersTimeEnum.MONTH,
      title: t('views.charts.time.month'),
      action: () => (selectedTimeId.value = filtersTimeEnum.MONTH),
   },
   {
      id: filtersTimeEnum.SIX_MONTHS,
      title: t('views.charts.time.6-months'),
      action: () => (selectedTimeId.value = filtersTimeEnum.SIX_MONTHS),
   },
])

const selectedTime = computed(() => {
   const date = new Date()

   switch (selectedTimeId.value) {
      case filtersTimeEnum.WEEK:
         return {
            from: subDays(date, 7),
            to: date,
         }
      case filtersTimeEnum.MONTH:
         return {
            from: subMonths(date, 1),
            to: date,
         }
      case filtersTimeEnum.SIX_MONTHS:
         return {
            from: subMonths(date, 6),
            to: date,
         }
      case filtersTimeEnum.CUSTOM:
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

const setSavedTimeseries = () => {
   const { query } = useRoute()
   console.log(query)
}

const onSaveRangeCustom = () => {
   selectedTimeId.value = filtersTimeEnum.CUSTOM
}

watch(selectedTime, (newVal) => {
   getTimeseriesData()
})

onMounted(() => {
   setSavedTimeseries()
   getTimeseriesData()
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

            & .chart-time-ct {
               @apply flex gap-2;
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
      }
   }
}

@media (max-width: theme('screens.md')) {
   .charts-view {
   }
}
</style>
