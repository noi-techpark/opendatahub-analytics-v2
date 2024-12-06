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
            :label-placeholder="$t('components.map.search')"
            type="text"
         />

         <div v-if="searchQuery || localSelectedItem" class="search-popup">
            <div v-if="localSelectedItem" class="search-selected">
               <P label bold>{{ $t('components.map.selected') }}</P>
               <IconText
                  grow
                  no-padding-y
                  :text="localSelectedItem?.sname"
                  small
                  reverse
               >
                  <CloseIcon @click="handleSelectSearch(undefined)" />
               </IconText>
            </div>
            <ul v-if="searchQuery" class="search-list">
               <li
                  v-for="item in searchResults"
                  @click="handleSelectSearch(item)"
               >
                  <IconText grow no-padding-y :text="item.sname" small>
                  </IconText>
               </li>
            </ul>
         </div>
      </div>
      <div id="map" />
   </div>
</template>

<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, h, onMounted, ref, render, watch } from 'vue'
import { DataMarker } from '../../../types/api'
import { coordinatesInRange, initMap } from '../../../utils/map-utils'
import { Map, Marker } from 'maplibre-gl'
import MapMarker from './MapMarker.vue'
import SpinnerIcon from '../svg/SpinnerIcon.vue'
import { MapMarkerDetails } from '../../../types/map-layer'
import InputSearch from '../input/InputSearch.vue'
import IconText from '../IconText.vue'
import CloseIcon from '../svg/CloseIcon.vue'
import P from '../tags/P.vue'

type Props = {
   loading?: boolean
   markers?: DataMarker[]
   selectedScode?: string
   preventZoomOnSelected?: boolean
   showSearch?: boolean | string
}

type Emit = {
   markerSelected: [MapMarkerDetails | undefined]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

let localMarkers: Marker[] = []

const mapLoaded = ref<boolean>()
const map = ref<Map>()
const localSelected = ref<string | undefined>(props.selectedScode)
const searchQuery = ref<string>()

const searchResults = computed(() => {
   if (searchQuery.value) {
      return props.markers?.filter((m) =>
         m.sname?.toLowerCase().includes(searchQuery.value?.toLowerCase() || '')
      )
   }
})
const localSelectedItem = computed(() => {
   return props.markers?.find((m) => m.scode === localSelected.value)
})

const handleSelectSearch = (data?: DataMarker) => {
   searchQuery.value = data?.sname
   handleMarkerSelected(data)
}

const handleMarkerSelected = (data?: DataMarker) => {
   emit('markerSelected', data)
   localSelected.value = data?.scode
   focus(data)
}

const focus = (data?: DataMarker) => {
   if (!props.preventZoomOnSelected && data) {
      map.value?.flyTo({
         center: {
            lng: data.coordinates[0],
            lat: data.coordinates[1],
         },
         duration: 1000,
         zoom: 15,
      })
   }
}

onMounted(() => {
   map.value = initMap()
   map.value.on('load', () => {
      mapLoaded.value = map.value?.loaded()
   })
   map.value.on('marker-click', (v) => {
      handleMarkerSelected(v.eventData)
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
         localMarkers.forEach((marker) => marker.remove())
         localMarkers = []

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
                  if (selected) {
                     focus(data)
                  }
                  const marker = new Marker({ element: el, anchor: 'bottom' })
                     .setLngLat(data.coordinates)
                     .addTo(map.value)
                  localMarkers.push(marker)
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
      @apply absolute left-4 top-4 z-[999] flex flex-col gap-1;

      & .search-popup {
         @apply max-w-72 rounded border bg-white text-xs;

         & .search-selected {
            @apply flex flex-col gap-2 border-b p-2;
         }
      }

      & .search-list {
         @apply flex flex-col gap-1 p-2;
      }
   }

   & #map {
      @apply h-full w-full;
   }
}
</style>
