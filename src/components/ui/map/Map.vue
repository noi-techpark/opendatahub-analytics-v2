<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="map-component">
    <div class="loading-ct" :class="{ active: loading || !mapLoaded }">
      <SpinnerIcon class="loading-indicator animate-spin" />
    </div>
    <div id="map" />
  </div>
</template>

<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import { h, onMounted, ref, render, watch } from 'vue'
import { DataMarker } from '../../../types/api'
import { coordinatesInRange, initMap } from '../../../utils/map-utils'
import { Map, Marker } from 'maplibre-gl'
import MapMarker from './MapMarker.vue'
import SpinnerIcon from '../svg/SpinnerIcon.vue'

type Props = {
  loading?: boolean
  markers?: DataMarker[]
  selectedScode?: string
}
type Emit = {
  markerPress: [string]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

const mapLoaded = ref<boolean>()
const map = ref<Map>()
let markers: Marker[] = []

watch(
  [() => props.markers, () => mapLoaded.value, () => props.selectedScode],
  ([currentProps, currentMapLoaded, currentSelected]) => {
    if (currentMapLoaded) {
      markers.forEach((marker) => marker.remove())
      markers = []

      currentProps
        ?.sort((p1, p2) => (p2.y || 0) - (p1.y || 0))
        .forEach((data) => {
          const selected = data.scode === currentSelected
          const coordinates = [data.x, data.y]

          if (map.value && coordinatesInRange(coordinates)) {
            const el = document.createElement('div')
            const vNode = h(MapMarker, {
              ...data,
              map: map.value,
              selected: selected,
            })
            render(vNode, el)
            const marker = new Marker({ element: el, anchor: 'bottom' })
              .setLngLat([data.x, data.y])
              .addTo(map.value)
            markers.push(marker)
          }

          if (selected) {
            map.value?.flyTo({
              center: { lng: coordinates[0], lat: coordinates[1] },
              duration: 1000,
              zoom: 15,
            })
          }
        })
    }
  }
)

onMounted(() => {
  map.value = initMap()
  map.value.on('load', () => {
    mapLoaded.value = map.value?.loaded()
  })
  map.value.on('marker-click', (v) => {
    emit('markerPress', v.eventData)
  })
})
</script>

<style lang="postcss" scoped>
.map-component {
  @apply absolute inset-0 w-full h-full z-[1];

  & .loading-ct {
    @apply opacity-0 flex items-center justify-center absolute inset-0 bg-black/50 z-[999] pointer-events-none transition-all;

    & .loading-indicator {
      @apply text-white size-10;
    }

    &.active {
      @apply opacity-100 pointer-events-auto;
    }
  }

  & #map {
    @apply w-full h-full;
  }
}
</style>
