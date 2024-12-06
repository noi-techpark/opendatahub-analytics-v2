<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="charts-add-view">
      <H tag="h1">{{ $t('views.charts-add.title') }}</H>

      <div class="input-cards-ct">
         <div class="input-card first">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.provider') }}</H>
                  <P>{{ $t('views.charts-add.provider-description') }}</P>
               </div>
               <ChardAddSelectWrapper>
                  <SelectPopover
                     v-model="selection.provider"
                     :text="
                        selection.provider ||
                        $t('views.charts-add.provider-select')
                     "
                     :search-label-placeholder="
                        $t('views.charts-add.search-for-dataprovider')
                     "
                     :loading="loadingState.provider"
                     :options="providerOptions"
                     show-search
                     @search="useFetchProviderOptions"
                  />
               </ChardAddSelectWrapper>
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.dataset') }}</H>
                  <P>{{ $t('views.charts-add.dataset-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.dataset"
                  :disabled="!selection.provider"
                  :text="
                     selection.dataset || $t('views.charts-add.dataset-select')
                  "
                  :options="datasetOptions"
                  :loading="loadingState.dataset"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-dataset')
                  "
                  show-search
                  @search="useFetchDatasetOptions"
               />
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.station') }}</H>
                  <P>{{ $t('views.charts-add.station-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.station"
                  :disabled="!selection.dataset || stationFromMap"
                  :text="
                     selection.station || $t('views.charts-add.station-select')
                  "
                  :options="stationOptions"
                  :loading="loadingState.station"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-station')
                  "
                  show-search
                  @search="useFetchStationOptions"
               />
            </div>
            <Switch v-model="stationFromMap" :disabled="!selection.dataset">
               <P>{{ $t('views.charts-add.station-map') }}</P>
            </Switch>

            <template v-if="stationFromMap">
               <IconText
                  :text="$t('views.charts-add.map-tooltip')"
                  class="map-tooltip"
               >
                  <LightbulbIcon class="text-grey-3" />
               </IconText>

               <Map
                  class="map-ct"
                  :loading="loadingState.station"
                  :markers="markers"
                  :selected-scode="
                     stations.find((s) => s.sname === selection.station)?.scode
                  "
                  show-search
                  @markerSelected="handleSelectMarker"
               />
            </template>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.datatype') }}</H>
                  <P>{{ $t('views.charts-add.datatype-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.datatype"
                  :disabled="!selection.station"
                  :text="
                     selection.datatype ||
                     $t('views.charts-add.datatype-select')
                  "
                  :options="datatypeOptions"
                  :loading="loadingState.datatype"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-datatype')
                  "
                  show-search
                  @search="useFetchDatatypeOptions"
               />
            </div>
         </div>

         <div class="input-card last">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.period') }}</H>
                  <P>{{ $t('views.charts-add.period-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.period"
                  :disabled="!selection.datatype"
                  :text="
                     selection.period || $t('views.charts-add.period-select')
                  "
                  :options="periodOptions"
                  :loading="loadingState.period"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-period')
                  "
                  show-search
               />
            </div>
         </div>

         <div class="buttons-ct">
            <Button outline @click="cancel">{{ $t('common.cancel') }}</Button>
            <Button @click="save">{{ $t('views.charts-add.save') }}</Button>
         </div>
      </div>
   </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import Switch from '../components/ui/Switch.vue'
import { computed, onMounted, ref, watch } from 'vue'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import { useFetch } from '@vueuse/core'
import { SelectOption } from '../types/select'
import ChardAddSelectWrapper from '../components/ui/chart/ChardAddSelectWrapper.vue'
import { TimeSeries } from '../types/time-series'
import { useTimeSeriesStore } from '../stores/time-series'
import { randomId } from '../components/utils/useRandomId'
import IconText from '../components/ui/IconText.vue'
import LightbulbIcon from '../components/ui/svg/LightbulbIcon.vue'
import Map from '../components/ui/map/Map.vue'
import { MapMarkerDetails } from '../types/map-layer'
import { DataMarker, DataPoint } from '../types/api'

const { addTimeSeries, colors, timeSeriesList } = useTimeSeriesStore()

const router = useRouter()
const stationFromMap = ref<boolean>(false)
const loadingState = ref({
   provider: false,
   dataset: false,
   station: false,
   datatype: false,
   period: false,
})

const providers = ref<{ sorigin: string }[]>([])
const datasets = ref<{ stype: string }[]>([])
const stations = ref<DataPoint[]>([])
const datatypes = ref<{ tname: string; tdescription: string }[]>([])
const markers = ref<DataMarker[]>([])

const selection = ref<TimeSeries>({
   id: randomId(),
   provider: '',
   dataset: '',
   station: '',
   datatype: '',
   period: '',
   color: colors[timeSeriesList.length],
   data: [],
})

const providerOptions = computed<SelectOption[]>(() => {
   return providers.value.map((item) => ({
      label: item.sorigin,
      value: item.sorigin,
   }))
})

const datasetOptions = computed<SelectOption[]>(() => {
   return datasets.value.map((item) => ({
      label: item.stype,
      value: item.stype,
   }))
})

const stationOptions = computed<SelectOption[]>(() => {
   return stations.value.map((item) => ({
      label: item.sname,
      value: item.sname,
   }))
})

const datatypeOptions = computed(() => {
   return datatypes.value.map((item) => ({
      label: item.tname,
      value: item.tname,
   }))
})

const periodOptions = computed(() => {
   return ['300', '600'].map((value) => ({
      label: `${value}s`,
      value,
   }))
})

const cancel = () => {
   router.replace(router?.options.history?.state?.back || '/')
}

const save = () => {
   // TODO: save the time series

   addTimeSeries(selection.value)
   router.push({ name: 'charts' })
}

const handleSelectMarker = (data?: MapMarkerDetails) => {
   const name = stations.value.find((s) => s.scode === data?.scode)?.sname
   if (name) {
      selection.value.station = name
   }
}

const useComputeILIKESearch = (key: string, searchVal?: string) => {
   if (!searchVal) return ''

   return `${key}.ire.${encodeURIComponent(searchVal)}`
}

const useFetchProviderOptions = async (searchVal?: string) => {
   loadingState.value.provider = true

   if (searchVal) {
      selection.value.provider = ''
   }

   const searchString = useComputeILIKESearch('sorigin', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/%2A?limit=-1&offset=0&where=${searchString}&select=sorigin&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   providers.value = data.value.data

   loadingState.value.provider = false
}

const useFetchDatasetOptions = async (searchVal?: string) => {
   loadingState.value.dataset = true

   if (searchVal) {
      selection.value.dataset = ''
   }

   const searchString = useComputeILIKESearch('stype', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/%2A?limit=-1&offset=0&select=stype&where=and(${searchString ? searchString + ',' : ''}sorigin.eq.${selection.value.provider})&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   datasets.value = data.value.data

   loadingState.value.dataset = false
}

const useFetchStationOptions = async (searchVal?: string) => {
   // TODO: implement infinite scroll
   loadingState.value.station = true

   if (searchVal) {
      selection.value.station = ''
   }

   const searchString = useComputeILIKESearch('sname', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}?limit=100&offset=0&select=sname,scode,scoordinate,stype&where=and(${searchString ? searchString + ',' : ''}sorigin.eq.${selection.value.provider})&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   stations.value = data.value.data

   markers.value = data.value.data.map(
      (d): DataMarker => ({
         scode: d.scode,
         sname: d.sname,
         stype: d.stype,
         color: '',
         coordinates: [d.scoordinate?.x || 0, d.scoordinate?.y || 0],
      })
   )

   loadingState.value.station = false
}

const useFetchDatatypeOptions = async (searchVal?: string) => {
   // TODO: implement infinite scroll
   loadingState.value.datatype = true

   if (searchVal) {
      selection.value.datatype = ''
   }

   const searchString = useComputeILIKESearch('tdescription', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}/*?limit=100&offset=0&select=tname,tdescription&where=and(${searchString ? searchString + ',' : ''}sorigin.eq.${selection.value.provider})&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   datatypes.value = data.value.data

   loadingState.value.datatype = false
}

onMounted(() => {
   useFetchProviderOptions()
})

watch(
   () => selection.value.provider,
   (newVal) => {
      if (!newVal) return

      useFetchDatasetOptions()
   }
)

watch(
   () => selection.value.dataset,
   (newVal) => {
      if (!newVal) return

      useFetchStationOptions()
   }
)

watch(
   () => selection.value.station,
   (newVal) => {
      if (!newVal) return

      useFetchDatatypeOptions()
   }
)
</script>

<style lang="postcss" scoped>
.charts-add-view {
   @apply flex flex-col gap-2;

   & .input-cards-ct {
      @apply flex max-w-[700px] flex-col pb-40;

      & .input-card {
         @apply flex w-full flex-col gap-2 border border-b-0 p-4;

         &.first {
            @apply rounded-t;
         }

         &.last {
            @apply rounded-b border-b;
         }

         & .input-card-header {
            @apply flex justify-between gap-2;
         }

         & .map-tooltip {
            @apply border-grey-3 bg-grey-3/10 border py-2;
         }

         & .map-ct {
            @apply h-96 w-full;
         }
      }

      & .buttons-ct {
         @apply mt-4 flex gap-2 self-end;
      }
   }
}

@media (max-width: theme('screens.md')) {
   .charts-view {
   }
}
</style>
