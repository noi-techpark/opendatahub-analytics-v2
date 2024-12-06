<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="map-component">
      <div class="loading-ct" :class="{ active: loading || !mapLoaded }">
         <SpinnerIcon class="loading-indicator animate-spin" />
      </div>
      <div class="search-ct" v-if="showSearch">
         <InputSearch
            id="search"
            v-model="searchQuery"
            :label-placeholder="
               typeof showSearch === 'string' ? showSearch : undefined
            "
            type="text"
         />

         <div class="">ciao</div>
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
import { MapMarkerDetails } from '../../../types/map-layer'
import InputSearch from '../input/InputSearch.vue'

type Props = {
   loading?: boolean
   markers?: DataMarker[]
   selectedScode?: string
   preventZoomOnSelected?: boolean
   showSearch?: boolean | string
}

type Emit = {
   markerSelected: [MapMarkerDetails]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

const mapLoaded = ref<boolean>()
const map = ref<Map>()
const localSelected = ref<string | undefined>(props.selectedScode)
const searchQuery = ref<string>()

let markers: Marker[] = []

onMounted(() => {
   map.value = initMap()
   map.value.on('load', () => {
      mapLoaded.value = map.value?.loaded()
   })
   map.value.on('marker-click', (v) => {
      emit('markerSelected', v.eventData)
      localSelected.value = v.eventData.scode

      if (!props.preventZoomOnSelected) {
         map.value?.flyTo({
            center: {
               lng: v.eventData.coordinates[0],
               lat: v.eventData.coordinates[1],
            },
            duration: 1000,
            zoom: 15,
         })
      }
   })
})

watch(
   () => props.selectedScode,
   (curr) => {
      localSelected.value = curr
   }
)

// TODO: reload markers when map reloads
watch(
   [() => props.markers, () => mapLoaded.value, () => localSelected.value],
   ([currentProps, currentMapLoaded, currentSelected]) => {
      if (currentMapLoaded) {
         markers.forEach((marker) => marker.remove())
         markers = []

         currentProps
            ?.sort((p1, p2) => p2.coordinates[1] - (p1.coordinates[1] || 0))
            .forEach((data) => {
               const selected =
                  data.scode === currentSelected ||
                  localSelected.value === data.scode

               if (map.value && coordinatesInRange(data.coordinates)) {
                  const el = document.createElement('div')
                  const vNode = h(MapMarker, {
                     ...data,
                     coordinates: data.coordinates,
                     map: map.value,
                     selected: selected,
                  })
                  render(vNode, el)
                  const marker = new Marker({ element: el, anchor: 'bottom' })
                     .setLngLat(data.coordinates)
                     .addTo(map.value)
                  markers.push(marker)
               }
            })
      }
   }
)
</script>

<style lang="postcss" scoped>
.map-component {
   @apply relative;

   & .loading-ct {
      @apply pointer-events-none absolute inset-0 z-[999] flex items-center justify-center bg-black-2/50 opacity-0 transition-all;

      & .loading-indicator {
         @apply size-10 text-white;
      }

      &.active {
         @apply pointer-events-auto opacity-100;
      }
   }

   & .search-ct {
      @apply absolute left-4 top-4 z-[999];
   }

   & #map {
      @apply h-full w-full;
   }
}
</style>
