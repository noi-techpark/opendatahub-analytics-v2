<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="charts-view">
      <div class="chart-title">
         <H tag="h1">{{ $t('views.charts.title') }}</H>
         <P>
            {{
               $t('common.updated-at', {
                  time: updatedAt,
               })
            }}
         </P>
      </div>

      <div class="chart-content-ct">
         <div class="chart-content">
            <div class="chart-control">
               <div class="chart-time-ct">
                  <MenuButtons :links :selectedIdx="selectedTimeIdx" />
                  <div>{{ $t('views.charts.time.custom') }}</div>
               </div>
               <div>
                  {{ $t('views.charts.plot-height') }}:
                  {{ plotHeights[selectedPlotHeightIdx].title }}
               </div>
            </div>
            <Chart
               title="Timeseries data"
               :updatedAt="updatedAt"
               :plotHeight="plotHeights[selectedPlotHeightIdx].value"
            />
         </div>

         <div class="chart-side">
            <div class="card">
               <P bold>{{ $t('views.charts.export.title') }}</P>
               <Button secondary :value="$t('views.charts.export.xls')">
                  <DownloadIcon />
               </Button>
               <Button secondary :value="$t('views.charts.export.xls')">
                  <DownloadIcon />
               </Button>
            </div>

            <div class="card">
               <IconText
                  class="justify-between"
                  bold
                  :text="$t('views.charts.embed')"
                  reverse
                  noPadding
                  :hover="false"
               >
                  <ContentCopyIcon />
               </IconText>
               <P class="card-content">EMBED CODE</P>
            </div>

            <Button center :value="$t('views.charts.save')">
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
import { computed, ref } from 'vue'
import DownloadIcon from '../components/ui/svg/DownloadIcon.vue'
import Button from '../components/ui/Button.vue'
import SaveIcon from '../components/ui/svg/SaveIcon.vue'
import IconText from '../components/ui/IconText.vue'
import ContentCopyIcon from '../components/ui/svg/ContentCopyIcon.vue'
import Chart from '../components/ui/chart/Chart.vue'

const { t } = useI18n()

const selectedTimeIdx = ref<number>(0)
const selectedPlotHeightIdx = ref<number>(0)
const updatedAt = new Date().toISOString()

const plotHeights = computed(() => [
   { title: t('common.auto'), value: 0 },
   { title: '500px', value: 500 },
])

const links = computed(() => [
   {
      title: t('views.charts.time.day'),
      action: () => (selectedTimeIdx.value = 0),
   },
   {
      title: t('views.charts.time.week'),
      action: () => (selectedTimeIdx.value = 1),
   },
   {
      title: t('views.charts.time.month'),
      action: () => (selectedTimeIdx.value = 2),
   },
   {
      title: t('views.charts.time.6-months'),
      action: () => (selectedTimeIdx.value = 3),
   },
])
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
