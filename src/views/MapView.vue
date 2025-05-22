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
import { useArrayDifference, useFetch } from '@vueuse/core'
import { DataMarker, DataPoint } from '../types/api'
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
import { useNotificationsStore } from '../stores/notifications'
import { watchDebounced } from '@vueuse/core'

const { showNotification } = useNotificationsStore()

const { t } = useI18n()
const layerStore = useMapLayerStore()
const loading = ref<number>(0)
const markers = ref<DataMarker[]>([])
const selectedScode = ref<string>()
const selectedMarker = ref<MapMarkerDetails>()
const { isTogglingAll, uniqueOrigins, selectedFilterOrigins } =
   storeToRefs(layerStore)
const lastLayers = ref<Layer[]>([])
const currentFilter = ref<string>('')

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

watchDebounced(
   selectedFilterOrigins,
   (newVal, oldVal) => {
      if (!oldVal.stype || newVal.stype !== oldVal.stype) {
         return
      }

      refetchForDataTypeWithFilters(newVal)
   },
   { deep: true, debounce: 500, maxWait: 1000 }
)

watch(
   () => layerStore.getSelectedLayers,
   async (curr, old) => {
      if (isTogglingAll.value) {
         return
      }

      setLayersToMap(curr, old)
   },
   { deep: true }
)

watch(isTogglingAll, (newVal) => {
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
      toggleAllLayers(arrayDiff.value)
   } else {
      uniqueOrigins.value = {}
   }
})

const refetchForDataTypeWithFilters = async (newVal: SelectedFilterOrigins) => {
   const layer = layerStore.getSelectedLayers.find((l) =>
      l.stationType.includes(newVal.stype)
   )
   if (!layer || !newVal.sorigin[newVal.stype]) {
      return
   }

   let filterString = newVal.sorigin[newVal.stype]
      .map((s) => `sorigin.ire.${s}`)
      .join(',')

   if (newVal.sorigin[newVal.stype].length > 1) {
      filterString = `or(${filterString})`
   }

   const newMarkers = await fetchStationData(layer, {
      stype: newVal.stype,
      filterString,
   })

   if (!newMarkers) {
      return
   }

   markers.value = newMarkers
}

const fetchStationData = async (
   layer: Layer,
   filter?: { stype: string; filterString: string }
) => {
   try {
      const currentMarkers = filter?.filterString
         ? [...markers.value.filter((item) => item.stype !== filter.stype)]
         : [...markers.value]
      const newMarkers: DataMarker[] = []
      let datasetType = 'node'
      let activeQuery = 'sactive.eq.true'
      let query = 'select=scoordinate%2Cscode%2Cstype%2Csorigin&where='
      if (layer.id === 'Traffic Events') {
         datasetType = 'edge'
         query = 'select=egeometry%2Cecode%2Cetype%2Ceorigin&where='
         activeQuery = 'eactive.eq.true'
      }

      if (filter?.filterString) {
         query += `and(${activeQuery},${filter.filterString})`
      } else {
         query += activeQuery
      }

      const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,${datasetType}/${layer.stationType}/?limit=-1&distinct=true&${query}`

      const flatData: DataPoint[] = JSON.parse(
         (await useFetch(url).text()).data.value || '{}'
      ).data

      if (flatData && flatData.length > 0) {
         const newPoints: DataMarker[] = []
         for (const d of flatData) {
            if (!uniqueOrigins.value[d.stype]) {
               uniqueOrigins.value[d.stype] = new Set()
            }

            uniqueOrigins.value[d.stype].add(d.sorigin)

            newPoints.push({
               scode: d.scode,
               sname: d.sname,
               color: layer.color,
               stype: d.stype,
               coordinates: [d.scoordinate?.x || 0, d.scoordinate?.y || 0],
            })
         }

         const uniquePoints = new Set(currentMarkers.map((p) => p.scode))
         newMarkers.push(
            ...currentMarkers,
            ...newPoints.filter((point) => !uniquePoints.has(point.scode))
         )
      } else {
         showNotification({
            type: 'error',
            message: t('views.map.noDataFor', {
               name: layer.stationType.join(', '),
            }),
         })
      }

      return newMarkers
   } catch (err) {
      console.error('An error occurred while processing the data:', err)
   }
}

const toggleAllLayers = async (layers: Layer[]) => {
   loading.value += 1

   const newMarkers: DataMarker[] = []

   for (const layer of layers) {
      newMarkers.push(...((await fetchStationData(layer)) || []))
      await nextTick()
   }

   markers.value = newMarkers

   loading.value -= 1
}

const setLayersToMap = async (curr: Layer[], old: Layer[]) => {
   loading.value += 1

   const arrayDiff = useArrayDifference(curr, old, (a, b) => a.id === b.id)
   const latestSelected = arrayDiff.value[0]

   if (latestSelected && curr.length > old.length) {
      const newMarkers = await fetchStationData(latestSelected)
      const uniquePoints = new Set(markers.value.map((p) => p.scode))

      if (newMarkers) {
         markers.value = [
            ...markers.value,
            ...newMarkers.filter((point) => !uniquePoints.has(point.scode)),
         ]
      }
   } else {
      const newTypes = new Set(curr.flatMap((n) => n.stationType))
      const oldTypes = old.flatMap((o) => o.stationType)
      const diff = oldTypes.filter((ot) => !newTypes.has(ot))
      diff.forEach((d) => {
         markers.value = markers.value.filter((p) => p.stype !== d)
         delete uniqueOrigins.value[d]
      })
   }

   loading.value -= 1
}

onMounted(() => {
   if (layerStore.getSelectedLayers.length > 0) {
      setLayersToMap(layerStore.getSelectedLayers, [])
   }
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
   }
}
</style>
