<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="map-view">
    <div class="map-filters-ct">
      <div>filtername1</div>
      <div>filtername2</div>
      <div>filtername3</div>
    </div>

    <MarkerCard
      v-if="selectedScode"
      :scode="selectedScode"
      @click="handleSelectMarker()"
    />
  </div>

  <Map
    :loading="loading > 0"
    :markers
    :selectedScode
    @markerPress="handleSelectMarker"
  />
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useLayerStore } from '../stores/map-layers'
import { useFetch } from '@vueuse/core'
import { FlatResponse, DataPoint, DataMarker } from '../types/api'
import MarkerCard from '../components/ui/MarkerCard.vue'

const layerStore = useLayerStore()
const loading = ref<number>(0)
const markers = ref<DataMarker[]>([])
const selectedScode = ref<string>()

const handleSelectMarker = (id?: string) => {
  selectedScode.value = id
}

watch(
  () => layerStore.getSelectedLayers,
  async (curr, old) => {
    loading.value += 1

    const latestSelected = curr.at(-1)

    if (latestSelected && curr.length > old.length) {
      try {
        const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${latestSelected.stationType[0]}/?limit=-1&distinct=true&select=scoordinate%2Cscode%2Cstype&where=`

        const { data, error } = await useFetch(url).text()

        if (error.value || !data.value) {
          console.error('Error fetching data:', error.value)
          return
        }

        const flatData: FlatResponse = JSON.parse(data.value)

        if (flatData && flatData.data) {
          const newPoints = flatData.data.map(
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
            ...newPoints.filter((point) => !uniquePoints.has(point.scode)),
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
  @apply relative z-20 ml-6 mt-2 w-fit;

  & .map-filters-ct {
    @apply mb-2 flex gap-2;
  }
}

@media (max-width: theme('screens.md')) {
}
</style>
