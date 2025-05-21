<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="map-view">
      <div class="map-filters-ct">
         <MapFilter title="filtername1" value="3" />
         <MapFilter title="filtername2" value="3" />
         <MapFilter title="filtername3" value="2" />
      </div>

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
import { ref, watch, onMounted, nextTick } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useMapLayerStore } from '../stores/map-layers'
import { useFetch } from '@vueuse/core'
import { DataMarker, DataPoint } from '../types/api'
import MarkerCard from '../components/ui/MarkerCard.vue'
import MapFilter from '../components/ui/map/MapFilter.vue'
import { MapMarkerDetails, Layer } from '../types/map-layer'
import { storeToRefs } from 'pinia'

const layerStore = useMapLayerStore()
const loading = ref<number>(0)
const markers = ref<DataMarker[]>([])
const selectedScode = ref<string>()
const selectedMarker = ref<MapMarkerDetails>()
const { isTogglingAll } = storeToRefs(layerStore)

const handleSelectMarker = async (data?: MapMarkerDetails) => {
   selectedScode.value = data?.scode
   selectedMarker.value = data
   layerStore.selectMarker(data)
}

// TODO: better handling of layer selection
watch(
   () => layerStore.getSelectedLayers,
   async (curr, old) => {
      if (isTogglingAll.value) return
      await setLayersToMap(curr, old)
   },
   { deep: true }
)

watch(isTogglingAll, (newVal) => {
   if (newVal) {
      markers.value = []
      setLayersToMap(layerStore.getSelectedLayers, [])
   }
})

const fetchStationData = async (layer: Layer) => {
   try {
      const currentMarkers = [...markers.value]
      const newMarkers: DataMarker[] = []
      const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${layer.stationType}/?limit=-1&distinct=true&select=scoordinate%2Cscode%2Cstype&where=sactive.eq.true`

      const flatData: DataPoint[] = JSON.parse(
         (await useFetch(url).text()).data.value || '{}'
      ).data

      if (flatData) {
         const newPoints = flatData.map(
            (d): DataMarker => ({
               scode: d.scode,
               sname: d.sname,
               color: layer.color,
               stype: d.stype,
               coordinates: [d.scoordinate?.x || 0, d.scoordinate?.y || 0],
            })
         )

         const uniquePoints = new Set(currentMarkers.map((p) => p.scode))
         newMarkers.push(
            ...currentMarkers,
            ...newPoints.filter((point) => !uniquePoints.has(point.scode))
         )
      }

      return newMarkers
   } catch (err) {
      console.error('An error occurred while processing the data:', err)
   }
}

const setLayersToMap = async (curr: Layer[], old: Layer[]) => {
   loading.value += 1

   if (isTogglingAll.value) {
      const newMarkers: DataMarker[] = []

      for (const layer of curr) {
         newMarkers.push(...((await fetchStationData(layer)) || []))
         await nextTick()
      }

      isTogglingAll.value = false

      markers.value = newMarkers

      loading.value -= 1

      return
   }

   const latestSelected = curr.at(-1)

   if (latestSelected && curr.length > old.length) {
      const newMarkers = await fetchStationData(latestSelected)
      if (newMarkers) {
         markers.value = [...markers.value, ...newMarkers]
      }
   } else {
      const newTypes = new Set(curr.map((n) => n.stationType[0]))
      const oldTypes = old.map((o) => o.stationType[0])
      const diff = oldTypes.filter((ot) => !newTypes.has(ot))

      diff.forEach((d) => {
         markers.value = markers.value.filter((p) => p.stype !== d)
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
