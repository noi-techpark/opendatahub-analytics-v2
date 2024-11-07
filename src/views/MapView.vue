<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- TODO: better handling of layer selection -->
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
      :loading="loading > 0"
      :markers
      :selectedScode
      @markerPress="handleSelectMarker"
   />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useLayerStore } from '../stores/map-layers'
import { useFetch } from '@vueuse/core'
import {
   DataMarker,
   DataPoint,
   MapMarkerDetails,
   MarkerData,
   MarkerInfo,
} from '../types/api'
import MarkerCard, { MarkerDetails } from '../components/ui/MarkerCard.vue'
import MapFilter from '../components/ui/map/MapFilter.vue'

const layerStore = useLayerStore()
const loading = ref<number>(0)
const markers = ref<DataMarker[]>([])
const selectedScode = ref<string>()
const selectedMarker = ref<MarkerDetails>()

const handleSelectMarker = async (data?: MapMarkerDetails) => {
   selectedScode.value = data?.scode
   layerStore.selectMarker(data)
   console.log(selectedScode.value)
   if (!data) {
      return
   }

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${data.stype}/*/latest?where=scode.eq.%22${data.scode}%22`
   const infoUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${data.stype}/?where=scode.eq.%22${data.scode}%22`

   const resInfo: MarkerInfo = JSON.parse(
      (await useFetch(infoUrl)).text().data.value || '{}'
   ).data
   const resData: MarkerData = JSON.parse(
      (await useFetch(dataUrl)).text().data.value || '{}'
   ).data

   // console.log(resData)
   // console.log(resInfo)

   selectedMarker.value = {
      name: resInfo[data.stype].stations[data.scode].sname,
   }
}

watch(
   () => layerStore.getSelectedLayers,
   async (curr, old) => {
      loading.value += 1

      const latestSelected = curr.at(-1)

      if (latestSelected && curr.length > old.length) {
         try {
            const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${latestSelected.stationType[0]}/?limit=-1&distinct=true&select=scoordinate%2Cscode%2Cstype&where=`

            const flatData: DataPoint[] = JSON.parse(
               (await useFetch(url).text()).data.value || '{}'
            ).data

            if (flatData) {
               const newPoints = flatData.map(
                  (d): DataMarker => ({
                     scode: d.scode,
                     color: latestSelected.color,
                     stype: d.stype,
                     x: d.scoordinate?.x || 0,
                     y: d.scoordinate?.y || 0,
                  })
               )

               const uniquePoints = new Set(markers.value.map((p) => p.scode))
               markers.value = [
                  ...markers.value,
                  ...newPoints.filter(
                     (point) => !uniquePoints.has(point.scode)
                  ),
               ]
            }
         } catch (err) {
            console.error('An error occurred while processing the data:', err)
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
   },
   { deep: true }
)
</script>

<style lang="postcss" scoped>
.map-view {
   @apply relative z-10 w-fit;

   & .map-filters-ct {
      @apply z-20 mb-2 flex gap-2 py-1;
   }
}

@media (max-width: theme('screens.md')) {
   .map-view {
   }
}
</style>
