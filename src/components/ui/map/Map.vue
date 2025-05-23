<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="map-component">
      <Loader :active="loading || !mapLoaded" />
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
import { computed, h, nextTick, onMounted, ref, render, watch } from 'vue'
import { DataMarker, StationMapMarker } from '../../../types/api'
import {
   createMarkerIcon,
   getBaseMarkerSvgUrl,
   getIconForStationType,
   initMap,
} from '../../../utils/map-utils'
import { Map, Marker } from 'maplibre-gl'
import { MapMarkerDetails } from '../../../types/map-layer'
import InputSearch from '../input/InputSearch.vue'
import IconText from '../IconText.vue'
import CloseIcon from '../svg/CloseIcon.vue'
import P from '../tags/P.vue'
import Loader from '../Loader.vue'

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

const preventMapUpdate = ref<boolean>(false)

const handleMarkerSelected = async (data?: DataMarker) => {
   preventMapUpdate.value = true
   emit('markerSelected', data)
   localSelected.value = data?.scode
   focus(data)

   await nextTick()
   preventMapUpdate.value = false
}

const focus = (data?: DataMarker) => {
   if (!props.preventZoomOnSelected && data) {
      map.value?.flyTo({
         center: {
            lng: data.coordinates[0],
            lat: data.coordinates[1],
         },
         duration: 1000,
         zoom: 15.1,
      })
   }
}

const clustersInMap = ref<Record<string, string[]>>({})

const clearCurrentClusterSource = async () => {
   if (!map.value) return

   try {
      for (const source in clustersInMap.value) {
         for (const layer of clustersInMap.value[source]) {
            if (map.value.getLayer(layer)) {
               map.value.removeLayer(layer)
            }
         }

         if (map.value.getSource(source)) {
            map.value.removeSource(source)
         }
      }

      clustersInMap.value = {}
   } catch (e) {
      console.error('Error during map cleanup:', e)
   }
}

const setMapClusterSource = async () => {
   if (!map.value) {
      return
   }

   await clearCurrentClusterSource()

   for (const [key, value] of Object.entries(stationMarkers.value)) {
      if (map.value.getSource(key)) {
         continue
      }

      map.value.addSource(key, {
         type: 'geojson',
         data: {
            type: 'FeatureCollection',
            features: value.map((marker) => ({
               type: 'Feature',
               geometry: {
                  type: 'Point',
                  coordinates: marker.coordinates,
               },
               properties: {
                  ...marker,
               },
            })),
         },
         cluster: true,
         clusterMaxZoom: 14, // Max zoom to cluster points on
         clusterRadius: 60,
      })

      const clusterLayerId = `${key}-cluster`
      const unclusteredLayerId = `${key}-unclustered`
      const unclusteredIconLayerId = `${key}-unclustered-icon`
      const clusterCountLayerId = `${key}-cluster-count`
      const unclusteredMarkerLayerId = `${key}-unclustered-marker`
      const unclusteredMarkerInfoLayerId = `${key}-unclustered-marker-info`
      map.value.addLayer({
         id: clusterLayerId,
         type: 'circle',
         source: key,
         filter: ['has', 'point_count'],
         paint: {
            'circle-color': [
               'step',
               ['get', 'point_count'],
               value[0].color,
               100,
               value[0].color,
               750,
               value[0].color,
            ],
            'circle-radius': [
               'step',
               ['get', 'point_count'],
               25,
               100,
               30,
               750,
               40,
            ],
         },
      })

      map.value.addLayer({
         id: clusterCountLayerId,
         type: 'symbol',
         source: key,
         filter: ['has', 'point_count'],
         layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Regular'],
            'text-size': 22,
            'text-allow-overlap': true,
         },
         paint: {
            'text-color': '#fff',
            'text-halo-color': 'rgba(0, 0, 0, 0.3)',
            'text-halo-blur': 1,
            'text-halo-width': 0.5,
         },
      })

      const iconId = `custom-marker-${key}-value`
      const iconUrl = getIconForStationType(value[0].stype)

      const svgUrl = getBaseMarkerSvgUrl(value[0].color)

      if (!map.value?.hasImage(iconId)) {
         try {
            const markerCanvas = await createMarkerIcon(svgUrl, iconUrl)
            const bitmap = await createImageBitmap(markerCanvas)
            map.value?.addImage(iconId, bitmap)
         } catch (e) {
            console.error('Failed to create marker icon', e)
         }
      }

      map.value?.addLayer({
         id: unclusteredMarkerLayerId,
         type: 'symbol',
         source: key,
         filter: ['!', ['has', 'point_count']],
         layout: {
            'icon-image': iconId,
            'icon-size': 1,
            'icon-allow-overlap': true,
         },
      })

      if (value[0].infoColor) {
         map.value?.addLayer({
            id: unclusteredMarkerInfoLayerId,
            type: 'circle',
            source: key,
            filter: ['!', ['has', 'point_count']],
            paint: {
               'circle-radius': 8,
               'circle-color': ['get', 'infoColor'],
               'circle-stroke-width': 2,
               'circle-stroke-color': '#fff',
               'circle-blur': 0,
               'circle-translate': [18, -30],
               'circle-translate-anchor': 'map',
            },
         })
      }

      clustersInMap.value[key] = [
         clusterLayerId,
         unclusteredLayerId,
         unclusteredIconLayerId,
         clusterCountLayerId,
         unclusteredMarkerLayerId,
         unclusteredMarkerInfoLayerId,
      ]

      map.value?.on('click', clusterLayerId, async (e) => {
         const features = map.value?.queryRenderedFeatures(e.point, {
            layers: [clusterLayerId],
         })
         const clusterId = features?.[0].properties?.cluster_id
         const source = map.value?.getSource(key)
         if (!source) return
         // @ts-ignore
         const zoom = await source.getClusterExpansionZoom(clusterId)
         map.value?.easeTo({
            // @ts-ignore
            center: features?.[0].geometry?.coordinates,
            zoom,
         })
      })

      handleMousePointerOnLayer(clusterLayerId)
      handleMousePointerOnLayer(unclusteredMarkerLayerId)
      handleClickOnMarker(unclusteredMarkerLayerId)
   }
}

const handleClickOnMarker = (layerId: string) => {
   map.value?.on('click', layerId, (e) => {
      const feature = e.features?.[0]
      if (feature && feature.properties) {
         const eventData = {
            ...feature.properties,
            // @ts-ignore
            coordinates: feature.geometry.coordinates,
         } as DataMarker
         handleMarkerSelected(eventData)
      }
   })
}

const handleMousePointerOnLayer = (layerId: string) => {
   map.value?.on('mouseenter', layerId, () => {
      const canvas = map.value?.getCanvas()
      if (canvas) canvas.style.cursor = 'pointer'
   })

   map.value?.on('mouseleave', layerId, () => {
      const canvas = map.value?.getCanvas()
      if (canvas) canvas.style.cursor = ''
   })
}

const stationMarkers = ref<Record<string, StationMapMarker[]>>({})

onMounted(() => {
   map.value = initMap()
   map.value.on('load', (e) => {
      mapLoaded.value = e.target.loaded()
   })
})

watch(
   () => props.selectedScode,
   (curr) => {
      localSelected.value = curr
   }
)

watch(
   [() => props.markers, () => mapLoaded.value, () => localSelected.value],
   ([currentProps, currentMapLoaded, currentSelected]) => {
      if (preventMapUpdate.value) {
         preventMapUpdate.value = false
         return
      }

      if (currentMapLoaded) {
         stationMarkers.value = {}

         currentProps
            ?.sort((p1, p2) => p2.coordinates[1] - (p1.coordinates[1] || 0))
            .forEach((data) => {
               const selected =
                  data.scode === currentSelected ||
                  localSelected.value === data.scode

               stationMarkers.value[data.stype] = [
                  ...(stationMarkers.value[data.stype] || []),
                  {
                     scode: data.scode,
                     color: data.color,
                     stype: data.stype,
                     coordinates: data.coordinates,
                     selected,
                     infoColor: data.infoColor,
                     eventData: JSON.stringify(data.eventData),
                  },
               ]
            })

         if (props.markers?.length) {
            setMapClusterSource()
         } else {
            clearCurrentClusterSource()
         }
      }
   }
)
</script>

<style lang="postcss" scoped>
.map-component {
   @apply relative;

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
