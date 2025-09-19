<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="map-view">
      <div class="map-filters-ct">
         <MapFilter
            :title="t('common.dataprovider')"
            :value="totalOriginsFilters.toString()"
            :disabled="Object.keys(uniqueOrigins).length === 0"
            @click="setCurrentFilter('origin')"
         />
      </div>

      <MapOriginFilterCard
         v-if="currentFilter === 'origin'"
         @close="setCurrentFilter('')"
      />
      <MarkerCard
         v-if="selectedMarker && selectedScode"
         :key="selectedMarker.scode"
         :marker="selectedMarker"
         @close="handleSelectMarker()"
      />
   </main>
   <Map
      class="map-ct"
      :loading="loading > 0"
      :markers
      :selectedScode
      @markerSelected="handleSelectMarker"
   />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useMapLayerStore } from '../stores/map-layers'
import { useArrayDifference } from '@vueuse/core'
import { DataMarker } from '../types/api'
import MapOriginFilterCard from '../components/ui/map/MapOriginFilterCard.vue'
import MarkerCard from '../components/ui/MarkerCard.vue'
import MapFilter from '../components/ui/map/MapFilter.vue'
import {
   MapMarkerDetails,
   Layer,
   SelectedFilterOrigins,
} from '../types/map-layer'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { watchDebounced } from '@vueuse/core'

import { Alarm } from '../types/alarm-config'
import { useLayerDataStore } from '../stores/layer-data'
import { useLayerDataFetcher } from '../composables/useLayerDataFetcher'
import { useQueryInit } from '../composables/useQueryInit'
import { useLayoutStore } from '../stores/layout'
import { useAutoRefreshStore } from '../stores/auto-refresh'

const layoutStore = useLayoutStore()
const { sidebarMapContent } = storeToRefs(layoutStore)

const { t } = useI18n()
const layerStore = useMapLayerStore()
const autoRefreshStore = useAutoRefreshStore()
const loading = ref<number>(0)
const selectedScode = ref<string>()
const layerDataStore = useLayerDataStore()
const {
   alarmConfig,
   markers,
   lastMarkersSet: sharedLastMarkersSet,
} = storeToRefs(layerDataStore)
const selectedMarker = ref<MapMarkerDetails>()
const { isTogglingAll, uniqueOrigins, selectedFilterOrigins } =
   storeToRefs(layerStore)
const lastLayers = ref<Layer[]>([])
const prevSelectedLayers = ref<Layer[]>([])
const currentFilter = ref<string>('')

const isInitialLoad = ref<boolean>(true)
const isRestoringFromSessionStorage = ref<boolean>(false)

const totalOriginsFilters = computed(
   () => Object.values(selectedFilterOrigins.value.sorigin).flat().length
)

const handleSelectMarker = async (data?: MapMarkerDetails) => {
   selectedScode.value = data?.scode
   selectedMarker.value = data
   layerStore.selectMarker(data)
}

const setCurrentFilter = (filter: string) => {
   currentFilter.value = filter
}

const getMarkerColorFromAlarmConfig = (
   stationType: string,
   dataType: string,
   value: number,
   hoursFromNow: number,
   period?: number
): string | undefined => {
   if (hoursFromNow > 24) return '#ddd'

   const stationAlarms = alarmConfig.value[stationType]
   if (!stationAlarms) return undefined

   const measurementAlarms = stationAlarms[dataType]
   if (!measurementAlarms || !measurementAlarms.alarms) return undefined

   let alarmsToCheck: Alarm[] = []

   if (period) {
      alarmsToCheck = measurementAlarms.alarms.filter(
         (alarm) => alarm.periods && alarm.periods.includes(period)
      )

      if (alarmsToCheck.length === 0) {
         alarmsToCheck = measurementAlarms.alarms.filter(
            (alarm) => !alarm.periods || alarm.periods.length === 0
         )
      }
   } else {
      alarmsToCheck = measurementAlarms.alarms
   }

   if (alarmsToCheck.length === 0) return undefined

   const sortedAlarms = [...alarmsToCheck].sort((a, b) => {
      const priorityMap: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return (
         priorityMap[a.priority as keyof typeof priorityMap] -
         priorityMap[b.priority as keyof typeof priorityMap]
      )
   })

   for (const alarm of sortedAlarms) {
      if (value >= alarm.thresholds.min && value <= alarm.thresholds.max) {
         switch (alarm.priority) {
            case 'high':
               return '#ff4d4f'
            case 'medium':
               return '#ffd600'
            case 'low':
               return '#34c759'
            default:
               return '#ddd'
         }
      }
   }

   return undefined
}

watchDebounced(
   selectedFilterOrigins,
   (newVal, oldVal) => {
      if (
         (!isInitialLoad.value && !oldVal.stype) ||
         newVal.stype !== oldVal.stype
      ) {
         return
      }

      if (!isInitialLoad.value) {
         const { saveToUrl } = useQueryInit()
         saveToUrl()
      }

      if (isRestoringFromSessionStorage.value) {
         return
      }

      refetchForDataTypeWithFilters(newVal)
   },
   { deep: true, debounce: 500, maxWait: 1000 }
)

watch(
   () => layerStore.getSelectedLayers,
   async (curr, old) => {
      const { saveToUrl } = useQueryInit()
      saveToUrl()

      const previous =
         old && Array.isArray(old) ? old : prevSelectedLayers.value
      if (previous !== undefined) {
         loading.value += 1
         const updated = await setLayersFromFetcher(curr, previous, {
            markers: markers.value,
            selectedFilterOrigins: selectedFilterOrigins.value,
            uniqueOrigins: uniqueOrigins.value,
            t,
            computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
               getMarkerColorFromAlarmConfig(
                  stype,
                  dataType,
                  value,
                  diffHours,
                  period
               ),
         })
         markers.value = updated
         loading.value -= 1
      }
      prevSelectedLayers.value = [...curr]
   },
   { deep: true }
)

watch(isTogglingAll, async (newVal) => {
   if (newVal) {
      lastLayers.value = [...layerStore.getSelectedLayers]
      return
   }

   const arrayDiff = useArrayDifference(
      layerStore.getSelectedLayers,
      lastLayers.value,
      (a, b) => a.id === b.id
   )

   if (arrayDiff.value.length > 0) {
      loading.value += 1
      await refreshSelectedLayers(arrayDiff.value, {
         selectedFilterOrigins: selectedFilterOrigins.value,
         uniqueOrigins: uniqueOrigins.value,
         markers: markers.value,
         t,
         computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
            getMarkerColorFromAlarmConfig(
               stype,
               dataType,
               value,
               diffHours,
               period
            ),
      })
      loading.value -= 1
   } else {
      markers.value = []
      uniqueOrigins.value = {}
   }
})

watch(
   markers,
   (newVal) => {
      sharedLastMarkersSet.value = newVal
   },
   { deep: true }
)

watch(
   () => autoRefreshStore.lastRefreshTime,
   async (newTime) => {
      if (newTime && layerStore.getSelectedLayers.length > 0) {
         loading.value += 1
         await refreshSelectedLayers(layerStore.getSelectedLayers, {
            selectedFilterOrigins: selectedFilterOrigins.value,
            uniqueOrigins: uniqueOrigins.value,
            markers: markers.value,
            t,
            computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
               getMarkerColorFromAlarmConfig(
                  stype,
                  dataType,
                  value,
                  diffHours,
                  period
               ),
         })
         loading.value -= 1
      }
   }
)

const {
   refetchForDataTypeWithFilters: refetchFromFetcher,
   setLayersToMap: setLayersFromFetcher,
   refreshSelectedLayers,
} = useLayerDataFetcher()

const refetchForDataTypeWithFilters = async (newVal: SelectedFilterOrigins) => {
   loading.value += 1
   const updated = await refetchFromFetcher(newVal, {
      selectedLayers: layerStore.getSelectedLayers,
      currentMarkers: markers.value,
      uniqueOrigins: uniqueOrigins.value,
      t,
      computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
         getMarkerColorFromAlarmConfig(
            stype,
            dataType,
            value,
            diffHours,
            period
         ),
   })
   if (updated) markers.value = updated
   loading.value -= 1
}

const setLayersToMap = async (curr: Layer[], old: Layer[]) => {
   loading.value += 1
   const updated = await setLayersFromFetcher(curr, old, {
      markers: markers.value,
      selectedFilterOrigins: selectedFilterOrigins.value,
      uniqueOrigins: uniqueOrigins.value,
      t,
      computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
         getMarkerColorFromAlarmConfig(
            stype,
            dataType,
            value,
            diffHours,
            period
         ),
   })
   markers.value = updated

   loading.value -= 1
}

onMounted(async () => {
   markers.value = []

   const { getStoredQueryString, saveSessionQuery } = useQueryInit()
   const storedParams = getStoredQueryString()
   const currentSearchParams = new URLSearchParams(window.location.search)
   const currentSearchString = currentSearchParams.toString()

   // Save current URL query parameters to session storage on initial load
   // This ensures we don't lose parameters when navigating
   if (currentSearchString) {
      sidebarMapContent.value = true
      saveSessionQuery(currentSearchParams)
   }

   if (storedParams && storedParams !== currentSearchString) {
      isRestoringFromSessionStorage.value = true
   }

   const { bootstrapFromUrl } = useQueryInit()
  await bootstrapFromUrl({
     afterInit: async () => {
        if (
           selectedFilterOrigins.value.stype &&
           selectedFilterOrigins.value.sorigin[
              selectedFilterOrigins.value.stype
           ]?.length > 0
        ) {
           await refetchForDataTypeWithFilters(selectedFilterOrigins.value)
        }
     },
  })

   if (markers.value.length === 0 && layerStore.getSelectedLayers.length > 0) {
      loading.value += 1
      await refreshSelectedLayers(layerStore.getSelectedLayers, {
         selectedFilterOrigins: selectedFilterOrigins.value,
         uniqueOrigins: uniqueOrigins.value,
         markers: markers.value,
         t,
         computeInfoColor: ({ stype, dataType, value, diffHours, period }) =>
            getMarkerColorFromAlarmConfig(
               stype,
               dataType,
               value,
               diffHours,
               period
            ),
      })
      loading.value -= 1
   }

   try {
      const { ensureAlarmConfigLoaded } = useLayerDataFetcher()
      await ensureAlarmConfigLoaded()
   } catch (error) {
      console.error('Failed to ensure alarm configuration:', error)
   }

   if (isInitialLoad.value) {
     isInitialLoad.value = false
  }

   nextTick(() => {
      setTimeout(() => {
         isRestoringFromSessionStorage.value = false
      }, 1000)
   })
})
</script>

<style lang="postcss" scoped>
.map-view {
   @apply relative z-10 w-fit;

   & .map-filters-ct {
      @apply z-20 mb-2 flex gap-2 py-1;
   }
}

.map-ct {
   @apply absolute inset-0 z-0 h-full w-full;
}

@media (max-width: theme('screens.md')) {
   .map-view {
      @apply w-full;
   }
}
</style>
