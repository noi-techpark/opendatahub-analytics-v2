<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="charts-add-view">
      <H tag="h1">{{
         isEdit
            ? t('views.charts-add-edit.title-edit')
            : t('views.charts-add-edit.title-add')
      }}</H>

      <div class="input-cards-ct">
         <div class="input-card first">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ t('views.charts-add-edit.provider') }}</H>
                  <P>{{ t('views.charts-add-edit.provider-description') }}</P>
               </div>
               <ChardAddSelectWrapper>
                  <SelectPopover
                     v-model="selection.provider"
                     :text="
                        selection.provider ||
                        t('views.charts-add-edit.provider-select')
                     "
                     :search-label-placeholder="
                        t('views.charts-add-edit.search-for-dataprovider')
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
                  <H tag="h2">{{ t('views.charts-add-edit.dataset') }}</H>
                  <P>{{ t('views.charts-add-edit.dataset-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.dataset"
                  :disabled="!selection.provider"
                  :text="
                     selection.dataset ||
                     t('views.charts-add-edit.dataset-select')
                  "
                  :options="datasetOptions"
                  :loading="loadingState.dataset"
                  :search-label-placeholder="
                     t('views.charts-add-edit.search-for-dataset')
                  "
                  show-search
                  @search="useFetchDatasetOptions"
               />
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ t('views.charts-add-edit.station') }}</H>
                  <P>{{ t('views.charts-add-edit.station-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.station"
                  :disabled="!selection.dataset || stationFromMap"
                  :text="
                     selection.station ||
                     t('views.charts-add-edit.station-select')
                  "
                  :options="stationOptions"
                  :loading="loadingState.station"
                  :search-label-placeholder="
                     t('views.charts-add-edit.search-for-station')
                  "
                  show-search
                  @search="useFetchStationOptions"
                  @scrollEnd="onScrollEndStations()"
               />
            </div>
            <Switch v-model="stationFromMap" :disabled="!selection.dataset">
               <P>{{ t('views.charts-add-edit.station-map') }}</P>
            </Switch>

            <template v-if="stationFromMap">
               <IconText
                  :text="t('views.charts-add-edit.map-tooltip')"
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
                  <H tag="h2">{{ t('views.charts-add-edit.datatype') }}</H>
                  <P>{{ t('views.charts-add-edit.datatype-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.datatype"
                  :disabled="!selection.station"
                  :text="
                     selection.datatype ||
                     t('views.charts-add-edit.datatype-select')
                  "
                  :options="datatypeOptions"
                  :loading="loadingState.datatype"
                  :search-label-placeholder="
                     t('views.charts-add-edit.search-for-datatype')
                  "
                  show-search
                  @search="useFetchDatatypeOptions"
                  @scrollEnd="onScrollEndDatatypes()"
               />
            </div>
         </div>

         <div class="input-card last">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ t('views.charts-add-edit.period') }}</H>
                  <P>{{ t('views.charts-add-edit.period-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.period"
                  :disabled="!selection.datatype"
                  :text="
                     selection.period ||
                     t('views.charts-add-edit.period-select')
                  "
                  :options="periodOptions"
                  :loading="loadingState.period"
                  :search-label-placeholder="
                     t('views.charts-add-edit.search-for-period')
                  "
                  show-search
               />
            </div>
         </div>

         <div class="buttons-ct">
            <Button outline @click="cancel">{{ t('common.cancel') }}</Button>
            <Button :disabled="isSaveUpdateDisabled" @click="save">{{
               isEdit
                  ? t('views.charts-add-edit.update')
                  : t('views.charts-add-edit.save')
            }}</Button>
         </div>
      </div>
   </main>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import Switch from '../components/ui/Switch.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import { useSessionStorage } from '@vueuse/core'
import { useFetchWithAuth } from '../utils/api'
import { SelectOption } from '../types/select'
import ChardAddSelectWrapper from '../components/ui/chart/ChardAddSelectWrapper.vue'
import { TimeSeries } from '../types/time-series'
import { useTimeSeriesStore } from '../stores/time-series'
import IconText from '../components/ui/IconText.vue'
import LightbulbIcon from '../components/ui/svg/LightbulbIcon.vue'
import Map from '../components/ui/map/Map.vue'
import { MapMarkerDetails } from '../types/map-layer'
import { DataMarker, DataPoint } from '../types/api'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const {
   addTimeSeries,
   updateTimeSeries,
   getBaseTimeSeriesObj,
   timeSeriesList,
} = useTimeSeriesStore()

const seriesToEditFromStorage = useSessionStorage(
   'series-to-edit',
   getBaseTimeSeriesObj()
)

const { t } = useI18n()

const { hasToLoad } = storeToRefs(useTimeSeriesStore())

const router = useRouter()
const route = useRoute()
const isSettingSelectionToEdit = ref<boolean>(false)
const stationFromMap = ref<boolean>(false)
const loadingState = ref({
   provider: false,
   dataset: false,
   station: false,
   datatype: false,
   period: false,
})

const pagination = ref({
   stations: {
      lastSearchVal: '',
      lastPage: 1,
      reachedMaxData: false,
   },
   datatypes: {
      lastSearchVal: '',
      lastPage: 1,
      reachedMaxData: false,
   },
})

const providers = ref<{ sorigin: string }[]>([])
const datasets = ref<{ stype: string }[]>([])
const stations = ref<DataPoint[]>([])
const datatypes = ref<{ tname: string; tdescription: string }[]>([])
const markers = ref<DataMarker[]>([])

const DEFAULT_LIMIT = 100

const selection = ref<TimeSeries>(getBaseTimeSeriesObj())

const isEdit = computed(() => {
   return route.name === 'charts-edit'
})

const isSaveUpdateDisabled = computed(() => {
   const { provider, dataset, station, datatype, period } = selection.value

   return !provider || !dataset || !station || !datatype || !period
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
   const routerState = router.options.history.state
   const backRoute =
      routerState && routerState.back ? routerState.back.toString() : '/'
   router.replace(backRoute)
}

const save = () => {
   if (isEdit.value) {
      updateTimeSeries(selection.value)
   } else {
      addTimeSeries(selection.value)
   }

   hasToLoad.value = true
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

   const { data } = await useFetchWithAuth(dataUrl).json()
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

   const { data } = await useFetchWithAuth(dataUrl).json()
   datasets.value = data.value.data

   loadingState.value.dataset = false
}

const useFetchStationOptions = async (searchVal?: string, page = 1) => {
   const isNewSearchVal =
      (searchVal || '') !== pagination.value.stations.lastSearchVal

   if (!isNewSearchVal && pagination.value.stations.reachedMaxData) {
      return
   }

   loadingState.value.station = true

   if (searchVal) {
      selection.value.station = ''
   }

   if (isNewSearchVal) {
      pagination.value.stations.reachedMaxData = false
      pagination.value.stations.lastPage = 1
      page = 1
   }

   const { limit, offset } = useComputePagination(page)

   const searchString = useComputeILIKESearch('sname', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}?limit=${limit}&offset=${offset}&select=sname,scode,scoordinate,stype&where=and(${searchString ? searchString + ',' : ''}sorigin.eq.${selection.value.provider})&shownull=false&distinct=true`

   const { data } = await useFetchWithAuth(dataUrl).json()
   const stationsData = data.value.data
   const stationsDataLength = stationsData?.length || 0

   pagination.value.stations.reachedMaxData =
      stationsDataLength === 0 || stationsDataLength < limit

   if (offset > 0) {
      stations.value = [...stations.value, ...stationsData]
      markers.value = [
         ...markers.value,
         ...getMarkersFromStations(stationsData),
      ]
   } else {
      stations.value = stationsData
      markers.value = getMarkersFromStations(stationsData)
   }

   pagination.value.stations.lastSearchVal = searchVal || ''
   loadingState.value.station = false
}

const useFetchDatatypeOptions = async (searchVal?: string, page = 1) => {
   const isNewSearchVal =
      (searchVal || '') !== pagination.value.datatypes.lastSearchVal

   if (!isNewSearchVal && pagination.value.datatypes.reachedMaxData) {
      return
   }

   loadingState.value.datatype = true

   if (searchVal) {
      selection.value.datatype = ''
   }

   if (isNewSearchVal) {
      pagination.value.datatypes.reachedMaxData = false
      pagination.value.datatypes.lastPage = 1
      page = 1
   }

   const { limit, offset } = useComputePagination(page)

   const searchString = useComputeILIKESearch('tname', searchVal)

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}/*?limit=${limit}&offset=${offset}&select=tname,tdescription&where=and(${searchString ? searchString + ',' : ''}sorigin.eq.${selection.value.provider})&shownull=false&distinct=true`

   const { data } = await useFetchWithAuth(dataUrl).json()

   const datatypesData = data.value.data
   const datatypesDataLength = datatypesData?.length || 0
   pagination.value.datatypes.reachedMaxData =
      datatypesDataLength === 0 || datatypesDataLength < limit

   if (offset > 0) {
      datatypes.value = [...datatypes.value, ...datatypesData]
   } else {
      datatypes.value = datatypesData
   }

   pagination.value.datatypes.lastSearchVal = searchVal || ''

   loadingState.value.datatype = false
}

const getMarkersFromStations = (data: DataPoint[]) => {
   return [...data].map(
      (d): DataMarker => ({
         scode: d.scode,
         sname: d.sname,
         stype: d.stype,
         color: '',
         coordinates: [d.scoordinate?.x || 0, d.scoordinate?.y || 0],
      })
   )
}

const useComputePagination = (page: number) => {
   return {
      limit: DEFAULT_LIMIT,
      offset: (page - 1) * DEFAULT_LIMIT,
   }
}

const setSelectionToEdit = () => {
   const seriesId = route.query.id
   const timeSeriesFromStore = timeSeriesList.find(
      (item) => item.id === route.query.id
   )

   const selectionToEdit = timeSeriesFromStore
      ? { ...timeSeriesFromStore, data: [], labels: [] }
      : seriesToEditFromStorage.value.id === seriesId
        ? { ...seriesToEditFromStorage.value, data: [], labels: [] }
        : undefined

   if (!selectionToEdit) {
      router.push({ name: 'charts' })
      return
   }

   isSettingSelectionToEdit.value = true
   selection.value = selectionToEdit
   seriesToEditFromStorage.value = selectionToEdit

   nextTick(() => {
      isSettingSelectionToEdit.value = false
   })
}

const onScrollEndStations = () => {
   pagination.value.stations.lastPage += 1
   const { lastPage, lastSearchVal } = pagination.value.stations

   useFetchStationOptions(lastSearchVal, lastPage)
}

const onScrollEndDatatypes = () => {
   pagination.value.datatypes.lastPage += 1
   const { lastPage, lastSearchVal } = pagination.value.datatypes

   useFetchDatatypeOptions(lastSearchVal, lastPage)
}

onMounted(() => {
   useFetchProviderOptions()
   if (route.query.id) {
      setSelectionToEdit()
   }
})

watch(
   () => selection.value.provider,
   () => {
      if (selection.value.provider) {
         useFetchDatasetOptions()
      }
   }
)

watch(
   () => selection.value.dataset,
   () => {
      if (selection.value.dataset) {
         useFetchStationOptions()
      }
   }
)

watch(
   () => selection.value.station,
   () => {
      if (selection.value.station) {
         useFetchDatatypeOptions()
      }
   }
)

watch(
   () => selection.value.datatype,
   () => {
      if (!isSettingSelectionToEdit.value) {
         selection.value.period = ''
      }
   }
)
</script>

<style lang="postcss" scoped>
.chart-add-edit-view {
  /* Component styles */
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
            @apply border border-grey-3 bg-grey-3/10 py-2;
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
