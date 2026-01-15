<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="map-filters-ct">
      <div class="flex-grow">
         <MapFilter
            :title="t('common.dataprovider')"
            :value="totalOriginsFilters.toString()"
            :disabled="Object.keys(uniqueOrigins).length === 0"
            @click="setCurrentFilter('origin')"
         />
      </div>
      <MapSettingsDropdown />
   </div>

   <MapOriginFilterCard
      v-if="currentFilter === 'origin'"
      @close="setCurrentFilter('')"
   />
   <MarkerCard
      v-if="selectedMarker && selectedScode"
      :key="selectedMarker.scode"
      :marker="selectedMarker"
      :open-on-measurements="!!focusScode"
      @vue:beforeUnmount="focusScode = undefined"
      @close="handleSelectMarker()"
   />
   <MapComponent
      class="map-ct"
      :loading="layerActionInProgress"
      :markers="markers"
      :selectedScode
      :focusScode
      @markerSelected="handleSelectMarker"
      @renderingChanged="handleMapRenderingChanged"
   />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import MapComponent from '../components/ui/map/Map.vue'
import { useMapLayerStore } from '../stores/map-layers'
import { useArrayDifference, watchDebounced } from '@vueuse/core'
import { DataMarker } from '../types/api'
import MapOriginFilterCard from '../components/ui/map/MapOriginFilterCard.vue'
import MarkerCard from '../components/ui/MarkerCard.vue'
import MapFilter from '../components/ui/map/MapFilter.vue'
import MapSettingsDropdown from '../components/ui/map/MapSettingsDropdown.vue'
import {
   MapMarkerDetails,
   Layer,
   SelectedFilterOrigins,
} from '../types/map-layer'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { Alarm } from '../types/alarm-config'
import { useLayerDataStore } from '../stores/layer-data'
import { useLayerDataFetcher } from '../composables/useLayerDataFetcher'
import { useQueryInit } from '../composables/useQueryInit'
import { useLayoutStore } from '../stores/layout'
import { useAutoRefreshStore } from '../stores/auto-refresh'
import { useRoute } from 'vue-router'
import { getColorForPriority } from '../utils/marker-utils'

const layoutStore = useLayoutStore()
const { sidebarMapContent } = storeToRefs(layoutStore)
const route = useRoute()

const { t } = useI18n()
const layerStore = useMapLayerStore()
const autoRefreshStore = useAutoRefreshStore()
const loading = ref<number>(0)
const selectedScode = ref<string>()
const focusHandled = ref<boolean>(false)
const focusScode = ref<string | undefined>(undefined)
const mapRendering = ref<boolean>(false)
const layerActionInProgress = ref<boolean>(false)

const nextFrame = () =>
   new Promise<void>((r) => requestAnimationFrame(() => r()))

const handleMapRenderingChanged = (v: boolean) => {
   mapRendering.value = v
   if (!v && loading.value === 0) layerActionInProgress.value = false
}

watch(loading, (v) => {
   if (v > 0) {
      layerActionInProgress.value = true
      return
   }
   if (!mapRendering.value) {
      layerActionInProgress.value = false
   }
})

const layerDataStore = useLayerDataStore()
const {
   alarmConfig,
   markers,
   lastMarkersSet: sharedLastMarkersSet,
} = storeToRefs(layerDataStore)
const selectedMarker = ref<MapMarkerDetails>()
const {
   isTogglingAll,
   uniqueOrigins,
   selectedFilterOrigins,
   hideInactiveSensors,
} = storeToRefs(layerStore)
const lastLayers = ref<Layer[]>([])
const prevSelectedLayers = ref<Layer[]>([])
const currentFilter = ref<string>('')

const isInitialLoad = ref<boolean>(true)
const isRestoringFromSessionStorage = ref<boolean>(false)

const totalOriginsFilters = computed(
   () => Object.values(selectedFilterOrigins.value.sorigin).flat().length
)

const handleSelectMarker = async (data?: MapMarkerDetails | DataMarker) => {
   const normalized: MapMarkerDetails | undefined = data
      ? {
           scode: String(data.scode),
           stype: (data as MapMarkerDetails | DataMarker).stype,
           eventData:
              typeof (data as any).eventData === 'string'
                 ? (data as any).eventData
                 : (data as any).eventData
                   ? JSON.stringify((data as any).eventData)
                   : undefined,
        }
      : undefined

   selectedScode.value = normalized?.scode
   selectedMarker.value = normalized
   layerStore.selectMarker(normalized)
}

const setCurrentFilter = (filter: string) => {
   currentFilter.value = filter
}

const getMarkerColorFromAlarmConfig = (
   stationType: string,
   dataType: string,
   value: number,
   period?: number
): string | undefined => {
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
         return getColorForPriority(alarm.priority)
      }
   }

   return undefined
}

watch(hideInactiveSensors, async () => {
   layerActionInProgress.value = true
   await nextTick()
   await nextFrame()
})

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
      layerActionInProgress.value = true
      await nextTick()
      await nextFrame()
      const { saveToUrl } = useQueryInit()
      saveToUrl()

      const previous =
         old && Array.isArray(old) ? old : prevSelectedLayers.value
      if (previous !== undefined) {
         loading.value += 1
         try {
            const updated = await setLayersFromFetcher(curr, previous, {
               markers: markers.value,
               selectedFilterOrigins: selectedFilterOrigins.value,
               uniqueOrigins: uniqueOrigins.value,
               t,
               computeInfoColor: ({ stype, dataType, value, period }) =>
                  getMarkerColorFromAlarmConfig(stype, dataType, value, period),
            })
            markers.value = updated
         } finally {
            loading.value -= 1
            if (loading.value === 0 && !mapRendering.value) {
               layerActionInProgress.value = false
            }
         }
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

   layerActionInProgress.value = true
   await nextTick()
   await nextFrame()

   const arrayDiff = useArrayDifference(
      layerStore.getSelectedLayers,
      lastLayers.value,
      (a, b) => a.id === b.id
   )

   if (arrayDiff.value.length > 0) {
      loading.value += 1
      try {
         await refreshSelectedLayers(arrayDiff.value, {
            selectedFilterOrigins: selectedFilterOrigins.value,
            uniqueOrigins: uniqueOrigins.value,
            markers: markers.value,
            t,
            computeInfoColor: ({ stype, dataType, value, period }) =>
               getMarkerColorFromAlarmConfig(stype, dataType, value, period),
         })
      } finally {
         loading.value -= 1
         if (loading.value === 0 && !mapRendering.value) {
            layerActionInProgress.value = false
         }
      }
   } else {
      markers.value = []
      uniqueOrigins.value = {}
      if (!mapRendering.value) {
         layerActionInProgress.value = false
      }
   }
})

watch(
   markers,
   (newVal) => {
      sharedLastMarkersSet.value = newVal
      tryFocusFromQuery()
   },
   { deep: true }
)

watch(
   () => autoRefreshStore.lastRefreshTime,
   async (newTime) => {
      if (newTime && layerStore.getSelectedLayers.length > 0) {
         loading.value += 1
         try {
            await refreshSelectedLayers(layerStore.getSelectedLayers, {
               selectedFilterOrigins: selectedFilterOrigins.value,
               uniqueOrigins: uniqueOrigins.value,
               markers: markers.value,
               t,
               computeInfoColor: ({ stype, dataType, value, period }) =>
                  getMarkerColorFromAlarmConfig(stype, dataType, value, period),
            })
         } finally {
            loading.value -= 1
         }
      }
   }
)

watch(
   () => layerStore.hideInactiveSensors,
   async () => {
      if (layerStore.getSelectedLayers.length > 0) {
         loading.value += 1
         try {
            // Pass empty markers array to force a complete refresh
            await refreshSelectedLayers(layerStore.getSelectedLayers, {
               selectedFilterOrigins: selectedFilterOrigins.value,
               uniqueOrigins: uniqueOrigins.value,
               markers: [],
               t,
               computeInfoColor: ({ stype, dataType, value, period }) =>
                  getMarkerColorFromAlarmConfig(stype, dataType, value, period),
            })
         } finally {
            loading.value -= 1
         }
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
   try {
      const updated = await refetchFromFetcher(newVal, {
         selectedLayers: layerStore.getSelectedLayers,
         currentMarkers: markers.value,
         uniqueOrigins: uniqueOrigins.value,
         t,
         computeInfoColor: ({ stype, dataType, value, period }) =>
            getMarkerColorFromAlarmConfig(stype, dataType, value, period),
      })
      if (updated) markers.value = updated
   } finally {
      loading.value -= 1
   }
}

const tryFocusFromQuery = () => {
   if (focusHandled.value) return
   const q = route.query as Record<string, string | undefined>
   const focusScodeParam = q.focusScode
   const focusCoords = q.focusCoords
   const focusName = q.focusName
   if (!markers.value || markers.value.length === 0) return

   let target: DataMarker | undefined
   // Prefer scode when provided
   if (focusScodeParam) {
      target = markers.value.find((m) => m.scode === focusScodeParam)
   }
   if (focusCoords) {
      const parts = focusCoords.split(',').map((v) => Number(v))
      if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
         const [x, y] = parts as [number, number]
         // Find exact or very close coordinate match
         target = markers.value.find((m) => {
            const [mx, my] = m.coordinates || [NaN, NaN]
            return Math.abs(mx - x) < 1e-6 && Math.abs(my - y) < 1e-6
         })
      }
   }
   if (!target && focusName) {
      const nameLc = focusName.toLowerCase()
      target = markers.value.find(
         (m) => (m.sname || '').toLowerCase() === nameLc
      )
   }

   if (target) {
      // Do not change selection; only pan/zoom via focusScode
      focusScode.value = target.scode
      focusHandled.value = true
   }
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
         computeInfoColor: ({ stype, dataType, value, period }) =>
            getMarkerColorFromAlarmConfig(stype, dataType, value, period),
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
.map-filters-ct {
   @apply absolute left-6 right-6 top-3 z-20 mb-2 flex gap-2 py-1;
}

.map-ct {
   @apply absolute inset-0 z-0 h-full w-full;
}

@media only screen and (max-width: theme('screens.md')) {
   .map-filters-ct {
      @apply left-4 right-4;
   }
}
</style>
