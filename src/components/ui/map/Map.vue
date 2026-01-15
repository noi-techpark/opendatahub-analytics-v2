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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { DataMarker, StationMapMarker } from '../../../types/api'
import { initMap } from '../../../utils/map-utils'
import {
   createMarkerIcon,
   getBaseMarkerSvgUrl,
   getIconForStationType,
   getProvinceColorForType,
   needsWhiteIcon,
} from '../../../utils/marker-utils'

import { Map } from 'maplibre-gl'
import { MapMarkerDetails } from '../../../types/map-layer'
import InputSearch from '../input/InputSearch.vue'
import IconText from '../IconText.vue'
import CloseIcon from '../svg/CloseIcon.vue'
import P from '../tags/P.vue'
import Loader from '../Loader.vue'
import { useMapLayerStore } from '../../../stores/map-layers'
import { storeToRefs } from 'pinia'

type Props = {
   loading?: boolean
   markers?: DataMarker[]
   selectedScode?: string
   focusScode?: string
   preventZoomOnSelected?: boolean
   showSearch?: boolean | string
}

type Emit = {
   markerSelected: [MapMarkerDetails | DataMarker | undefined]
   renderingChanged: [boolean]
   boundsChanged: [
      {
         bounds: {
            west: number
            south: number
            east: number
            north: number
         }
         zoom: number
         reason: 'load' | 'moveend' | 'zoomend'
      },
   ]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

const mapLoaded = ref<boolean>()
const map = ref<Map>()
const localSelected = ref<string | undefined>(props.selectedScode)
const searchQuery = ref<string>()
const geojsonBySourceKey = ref<Record<string, any>>({})
const pendingGeojsonBySourceKey = ref<Record<string, any>>({})
const scheduledSetDataBySourceKey = ref<Record<string, boolean>>({})
const setDataTokenBySourceKey = ref<Record<string, number>>({})

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

const mapRendering = ref<boolean>(false)
const renderToken = ref<number>(0)

const setRendering = (active: boolean) => {
   if (mapRendering.value === active) return
   mapRendering.value = active
   emit('renderingChanged', active)
}

const markRenderStart = () => {
   if (!map.value || !mapLoaded.value) return
   renderToken.value += 1
   const token = renderToken.value
   setRendering(true)
   map.value.once('idle', () => {
      if (renderToken.value !== token) return
      setRendering(false)
   })
}

const preventMapUpdate = ref<boolean>(false)
const lastRenderedMarkers = ref<DataMarker[] | undefined>(undefined)
const lastRenderedSelected = ref<string | undefined>(undefined)

const missingImageInFlight = new Set<string>()

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
const clusterEnabledBySourceKey = ref<Record<string, boolean>>({})
const mapLayerStore = useMapLayerStore()
const { showAlarms } = storeToRefs(mapLayerStore)

const lastRenderedShowAlarms = ref<boolean | undefined>(undefined)

const setSelectedOnSource = (
   sourceKey: string,
   scode: string,
   selected: boolean
) => {
   if (!map.value) return
   const cached = geojsonBySourceKey.value[sourceKey]
   if (!cached || !cached.features) return

   let changed = false
   for (const f of cached.features) {
      const fid = (f as any).id
      if (fid === scode) {
         ;(f as any).properties = (f as any).properties || {}
         if ((f as any).properties.selected !== selected) {
            ;(f as any).properties.selected = selected
            changed = true
         }
         break
      }
   }

   if (changed) {
      try {
         scheduleSetData(sourceKey, cached)
      } catch (_) {
         // noop
      }
   }
}

const scheduleSetData = (sourceKey: string, geojson: any) => {
   if (!map.value) return
   if (!mapLoaded.value) return

   pendingGeojsonBySourceKey.value[sourceKey] = geojson
   const scheduled = scheduledSetDataBySourceKey.value[sourceKey]
   if (scheduled) return

   scheduledSetDataBySourceKey.value[sourceKey] = true
   const nextToken = (setDataTokenBySourceKey.value[sourceKey] || 0) + 1
   setDataTokenBySourceKey.value[sourceKey] = nextToken

   requestAnimationFrame(() => {
      const currentToken = setDataTokenBySourceKey.value[sourceKey]
      if (currentToken !== nextToken) {
         scheduledSetDataBySourceKey.value[sourceKey] = false
         scheduleSetData(sourceKey, pendingGeojsonBySourceKey.value[sourceKey])
         return
      }

      const pending = pendingGeojsonBySourceKey.value[sourceKey]
      scheduledSetDataBySourceKey.value[sourceKey] = false
      if (!pending) return

      try {
         markRenderStart()
         // @ts-ignore
         map.value?.getSource(sourceKey)?.setData(pending)
      } catch (e) {
         console.error('Failed to update GeoJSON source data', e)
      }
   })
}

const syncSelectedToSources = (newScode?: string, oldScode?: string) => {
   if (!map.value || !mapLoaded.value) return
   if (oldScode) {
      const oldMarker = props.markers?.find((m) => m.scode === oldScode)
      if (oldMarker) setSelectedOnSource(oldMarker.stype, oldScode, false)
   }
   if (newScode) {
      const newMarker = props.markers?.find((m) => m.scode === newScode)
      if (newMarker) setSelectedOnSource(newMarker.stype, newScode, true)
   }
}

const clearCurrentClusterSource = async () => {
   if (!map.value) return

   try {
      markRenderStart()
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

   const yieldToBrowser = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

   const DEFAULT_YIELD_EVERY = 200
   const DEFAULT_YIELD_THRESHOLD = 1500

   // Incremental update: avoid full teardown/rebuild (very expensive for large marker sets)
   const nextKeys = new Set(Object.keys(stationMarkers.value))
   const existingKeys = Object.keys(clustersInMap.value)
   for (let i = 0; i < existingKeys.length; i++) {
      const sourceKey = existingKeys[i]
      if (!nextKeys.has(sourceKey)) {
         markRenderStart()
         for (const layerId of clustersInMap.value[sourceKey] || []) {
            if (map.value.getLayer(layerId)) {
               map.value.removeLayer(layerId)
            }
         }
         if (map.value.getSource(sourceKey)) {
            map.value.removeSource(sourceKey)
         }
         delete clustersInMap.value[sourceKey]
         delete geojsonBySourceKey.value[sourceKey]
      }
   }

   for (const [key, value] of Object.entries(stationMarkers.value)) {
      const wantsClustering = !value.some(
         (m: any) => (m as any).pseudoCluster === true
      )

      const sourceExists = !!map.value.getSource(key)
      const shouldRecreateSource =
         sourceExists &&
         typeof clusterEnabledBySourceKey.value[key] === 'boolean' &&
         clusterEnabledBySourceKey.value[key] !== wantsClustering

      if (shouldRecreateSource) {
         markRenderStart()
         for (const layerId of clustersInMap.value[key] || []) {
            if (map.value.getLayer(layerId)) {
               map.value.removeLayer(layerId)
            }
         }
         if (map.value.getSource(key)) {
            map.value.removeSource(key)
         }
         delete clustersInMap.value[key]
         delete geojsonBySourceKey.value[key]
         delete clusterEnabledBySourceKey.value[key]
      }

      const hasSourceAfterRecreate = !!map.value.getSource(key)
      const features: any[] = []
      const layerSize = value.length
      const yieldEvery =
         layerSize > 30000
            ? 1200
            : layerSize > 12000
              ? 600
              : DEFAULT_YIELD_EVERY
      const yieldThreshold =
         layerSize > 30000
            ? 8000
            : layerSize > 12000
              ? 4000
              : DEFAULT_YIELD_THRESHOLD
      for (let i = 0; i < value.length; i++) {
         if (value.length > yieldThreshold && i > 0 && i % yieldEvery === 0) {
            await yieldToBrowser()
         }
         const marker = value[i]
         features.push({
            type: 'Feature',
            id: marker.scode,
            geometry: {
               type: 'Point',
               coordinates: marker.coordinates,
            },
            properties: {
               scode: marker.scode,
               stype: marker.stype,
               alarm: marker.alarm,
               inactive: marker.inactive,
               recent: marker.recent,
               infoColor: marker.infoColor,
            },
         })
      }

      if (hasSourceAfterRecreate) {
         // Update existing source data in-place; do not recreate layers/images.
         geojsonBySourceKey.value[key] = {
            type: 'FeatureCollection',
            features,
         }
         try {
            if (features.length > yieldThreshold) {
               await yieldToBrowser()
            }
            scheduleSetData(key, geojsonBySourceKey.value[key])
            if (features.length > yieldThreshold) {
               await yieldToBrowser()
            }
         } catch (e) {
            console.error('Failed to update GeoJSON source data', e)
         }
         continue
      }

      map.value.addSource(key, {
         type: 'geojson',
         data: {
            type: 'FeatureCollection',
            features,
         },
         cluster: wantsClustering,
         clusterMaxZoom: 14, // Max zoom to cluster points on
         clusterRadius: 60,
      })

      markRenderStart()

      clusterEnabledBySourceKey.value[key] = wantsClustering

      // Keep a reference to the GeoJSON so we can toggle selected without rebuilding layers.
      geojsonBySourceKey.value[key] = {
         type: 'FeatureCollection',
         features,
      }

      const clusterLayerId = `${key}-cluster`
      const unclusteredLayerId = `${key}-unclustered`
      const unclusteredIconLayerId = `${key}-unclustered-icon`
      const clusterCountLayerId = `${key}-cluster-count`
      const unclusteredMarkerLayerId = `${key}-unclustered-marker`
      const unclusteredMarkerInfoLayerId = `${key}-unclustered-marker-info`
      const unclusteredCountLayerId = `${key}-unclustered-count`

      map.value.addLayer({
         id: clusterLayerId,
         type: 'symbol',
         source: key,
         filter: ['has', 'point_count'],
         layout: {
            'icon-image': `custom-marker-${key}-cluster`,
            'icon-size': 1,
            'icon-allow-overlap': true,
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
            'text-size': 10,
            'text-allow-overlap': true,
         },
         paint: {
            'text-color': '#000',
            'text-halo-width': 0,
            'text-translate': [0, 12],
            'text-translate-anchor': 'map',
         },
      })

      const clusterIconId = `custom-marker-${key}-cluster`
      const singleIconId = `custom-marker-${key}-single`
      const singleSelectedIconId = `custom-marker-${key}-single-selected`
      const singleAlarmIconId = `custom-marker-${key}-single-alarm`
      const singleSelectedAlarmIconId = `custom-marker-${key}-single-selected-alarm`
      const singleInactiveIconId = `custom-marker-${key}-single-inactive`
      const singleInactiveSelectedIconId = `custom-marker-${key}-single-inactive-selected`
      const singleInactiveAlarmIconId = `custom-marker-${key}-single-inactive-alarm`
      const singleInactiveSelectedAlarmIconId = `custom-marker-${key}-single-inactive-selected-alarm`
      const layerForStype = mapLayerStore.getLayerByStationType(key)
      const letter = layerForStype?.id?.[0]?.toUpperCase() || ''
      const isProvince = key.startsWith('PROVINCE_BZ')
      // Build CLUSTER icon
      const clusterBaseColor = value[0].iconColor || value[0].color
      const clusterSvgUrl = getBaseMarkerSvgUrl(
         clusterBaseColor,
         letter,
         false,
         false
      )
      if (!map.value?.hasImage(clusterIconId)) {
         try {
            // For province clusters, use generic cluster icon and force white overlay on grey
            const clusterOverlayUrl = isProvince
               ? getIconForStationType('PROVINCE_BZ')
               : undefined
            const clusterYOffset = isProvince ? -4 : undefined
            const clusterTint = isProvince ? '#FFFFFF' : undefined
            const clusterCanvas = await createMarkerIcon(
               clusterSvgUrl,
               clusterOverlayUrl,
               24,
               clusterYOffset,
               clusterTint,
               false
            )
            const clusterBitmap = await createImageBitmap(clusterCanvas)
            map.value?.addImage(clusterIconId, clusterBitmap, {
               pixelRatio: 1.5,
            })
         } catch (e) {
            console.error('Failed to create cluster marker icon', e)
         }
      }

      // Build SINGLE icon
      const singleIconOverlay = isProvince
         ? getIconForStationType(value[0].stype)
         : undefined
      const singleBaseColor = isProvince
         ? getProvinceColorForType(value[0].stype)
         : value[0].iconColor || value[0].color
      const buildSingleIcon = async (
         id: string,
         opts?: { selected?: boolean; alarm?: boolean; inactive?: boolean }
      ) => {
         if (map.value?.hasImage(id)) return
         try {
            // Province singles: 28x28 inner box, white overlay for red/blue, slight recenter
            const iconBox = isProvince ? 28 : 22
            const overlayTint =
               isProvince && needsWhiteIcon(singleBaseColor)
                  ? '#FFFFFF'
                  : undefined
            const yOffset = isProvince ? -1 : undefined
            const svgUrl = getBaseMarkerSvgUrl(
               singleBaseColor,
               letter,
               false,
               isProvince /* fullCircle for province */,
               opts
            )
            const canvas = await createMarkerIcon(
               svgUrl,
               singleIconOverlay,
               iconBox,
               yOffset,
               overlayTint,
               isProvince
            )
            const bitmap = await createImageBitmap(canvas)
            map.value?.addImage(id, bitmap, { pixelRatio: 1.5 })
         } catch (e) {
            console.error('Failed to create single marker icon', e)
         }
      }

      // Default variants
      await buildSingleIcon(singleIconId)
      await buildSingleIcon(singleSelectedIconId, { selected: true })
      await buildSingleIcon(singleAlarmIconId, { alarm: true })
      await buildSingleIcon(singleSelectedAlarmIconId, {
         selected: true,
         alarm: true,
      })
      // Inactive variants
      await buildSingleIcon(singleInactiveIconId, { inactive: true })
      await buildSingleIcon(singleInactiveSelectedIconId, {
         inactive: true,
         selected: true,
      })
      await buildSingleIcon(singleInactiveAlarmIconId, {
         inactive: true,
         alarm: true,
      })
      await buildSingleIcon(singleInactiveSelectedAlarmIconId, {
         inactive: true,
         selected: true,
         alarm: true,
      })

      try {
         const idsToCheck = [
            singleIconId,
            singleSelectedIconId,
            singleAlarmIconId,
            singleSelectedAlarmIconId,
            singleInactiveIconId,
            singleInactiveSelectedIconId,
            singleInactiveAlarmIconId,
            singleInactiveSelectedAlarmIconId,
         ]
         for (const id of idsToCheck) {
            if (!map.value?.hasImage(id)) {
               console.error('Missing marker image in map style', {
                  id,
                  stype: key,
               })
            }
         }
      } catch (_) {
         // noop
      }

      map.value?.addLayer({
         id: unclusteredMarkerLayerId,
         type: 'symbol',
         source: key,
         filter: ['!', ['has', 'point_count']],
         layout: {
            'icon-image': [
               'case',
               [
                  'all',
                  ['==', ['get', 'inactive'], true],
                  ['==', ['get', 'selected'], true],
                  ['==', ['get', 'alarm'], true],
               ],
               singleInactiveSelectedAlarmIconId,
               [
                  'all',
                  ['==', ['get', 'inactive'], true],
                  ['==', ['get', 'selected'], true],
               ],
               singleInactiveSelectedIconId,
               [
                  'all',
                  ['==', ['get', 'inactive'], true],
                  ['==', ['get', 'alarm'], true],
               ],
               singleInactiveAlarmIconId,
               ['==', ['get', 'inactive'], true],
               singleInactiveIconId,
               [
                  'all',
                  ['==', ['get', 'selected'], true],
                  ['==', ['get', 'alarm'], true],
               ],
               singleSelectedAlarmIconId,
               ['==', ['get', 'selected'], true],
               singleSelectedIconId,
               ['==', ['get', 'alarm'], true],
               singleAlarmIconId,
               singleIconId,
            ],
            'icon-size': 1,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-optional': true,
         },
      })

      // For province singles, do NOT render the '1' count
      if (!isProvince) {
         map.value?.addLayer({
            id: unclusteredCountLayerId,
            type: 'symbol',
            source: key,
            filter: ['!', ['has', 'point_count']],
            layout: {
               'text-field': '1',
               'text-font': ['Open Sans Regular'],
               'text-size': 10,
               'text-allow-overlap': true,
               'text-ignore-placement': true,
               'text-optional': true,
            },
            paint: {
               'text-color': '#000',
               'text-halo-width': 0,
               'text-translate': [0, 12],
               'text-translate-anchor': 'map',
            },
         })
      }

      map.value?.addLayer({
         id: unclusteredMarkerInfoLayerId,
         type: 'circle',
         source: key,
         filter: [
            'all',
            ['!', ['has', 'point_count']],
            ['has', 'infoColor'],
            ['!=', ['get', 'alarm'], true],
         ],
         paint: {
            'circle-radius': 8,
            'circle-color': ['get', 'infoColor'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0,
            'circle-stroke-opacity': 0,
            'circle-blur': 0,
            'circle-translate': [18, -30],
            'circle-translate-anchor': 'map',
         },
      })

      // "latest" within 24hrs indicator
      const unclusteredMarkerStaleLayerId = `${key}-unclustered-marker-recent`
      map.value?.addLayer({
         id: unclusteredMarkerStaleLayerId,
         type: 'circle',
         source: key,
         filter: [
            'all',
            ['!', ['has', 'point_count']],
            ['==', ['get', 'recent'], true],
         ],
         paint: {
            'circle-radius': 6.5,
            'circle-color': '#BABABA',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-opacity': 1,
            'circle-blur': 0,
            'circle-translate': [13, -23],
            'circle-translate-anchor': 'map',
         },
      })

      clustersInMap.value[key] = [
         clusterLayerId,
         unclusteredLayerId,
         unclusteredIconLayerId,
         clusterCountLayerId,
         unclusteredMarkerLayerId,
         unclusteredMarkerInfoLayerId,
         unclusteredCountLayerId,
         unclusteredMarkerStaleLayerId,
      ]

      if (wantsClustering) {
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
      }

      handleMousePointerOnLayer(clusterLayerId)
      handleMousePointerOnLayer(unclusteredMarkerLayerId)
      handleClickOnMarker(unclusteredMarkerLayerId)
   }
}

const handleClickOnMarker = (layerId: string) => {
   map.value?.on('click', layerId, async (e) => {
      const feature = e.features?.[0]
      if (feature && feature.properties) {
         if (map.value) {
            const clusterLayerIds = Object.keys(clustersInMap.value)
               .map((k) => `${k}-cluster`)
               .filter((id) => map.value?.getLayer(id))

            if (clusterLayerIds.length > 0) {
               const clusterFeatures = map.value.queryRenderedFeatures(
                  e.point,
                  {
                     layers: clusterLayerIds,
                  }
               )
               const cluster = clusterFeatures?.[0]
               const clusterId = (cluster?.properties as any)?.cluster_id
               const clusterLayerId = (cluster as any)?.layer?.id as
                  | string
                  | undefined
               const sourceKey = clusterLayerId?.endsWith('-cluster')
                  ? clusterLayerId.slice(0, -'-cluster'.length)
                  : undefined

               if (cluster && clusterId != null && sourceKey) {
                  try {
                     const source = map.value.getSource(sourceKey) as any
                     if (!source) return
                     const zoom = await (source as any).getClusterExpansionZoom(
                        clusterId
                     )
                     map.value.easeTo({
                        center: (cluster.geometry as any)?.coordinates,
                        zoom,
                     })
                  } catch (_) {
                     // noop
                  }
                  return
               }
            }
         }

         const scode =
            ((feature as any).id as string | undefined) ||
            ((feature.properties as any).scode as string | undefined)
         const marker = scode
            ? props.markers?.find((m) => m.scode === scode)
            : undefined
         const eventData =
            marker ||
            ({
               scode: scode || '',
               stype: (feature.properties as any).stype,
               // @ts-ignore
               coordinates: feature.geometry.coordinates,
            } as DataMarker)
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

      map.value?.on('styleimagemissing', async (evt: any) => {
         try {
            const id = evt?.id as string | undefined
            if (!id) return
            if (!id.startsWith('custom-marker-')) return
            if (!map.value) return
            if (map.value.hasImage(id)) return
            if (missingImageInFlight.has(id)) return
            missingImageInFlight.add(id)

            const suffixes = [
               '-cluster',
               '-single',
               '-single-selected',
               '-single-alarm',
               '-single-selected-alarm',
               '-single-inactive',
               '-single-inactive-selected',
               '-single-inactive-alarm',
               '-single-inactive-selected-alarm',
            ]

            let matchedSuffix: string | undefined
            for (const s of suffixes) {
               if (id.endsWith(s)) {
                  matchedSuffix = s
                  break
               }
            }
            if (!matchedSuffix) return

            const stype = id
               .slice('custom-marker-'.length)
               .slice(0, -matchedSuffix.length)
            if (!stype) return

            const first = stationMarkers.value[stype]?.[0]
            if (!first) return

            const layerForStype = mapLayerStore.getLayerByStationType(stype)
            const letter = layerForStype?.id?.[0]?.toUpperCase() || ''
            const isProvince = stype.startsWith('PROVINCE_BZ')

            const buildSingleIcon = async (opts?: {
               selected?: boolean
               alarm?: boolean
               inactive?: boolean
            }) => {
               const singleIconOverlay = isProvince
                  ? getIconForStationType(stype)
                  : undefined
               const singleBaseColor = isProvince
                  ? getProvinceColorForType(stype)
                  : first.iconColor || first.color
               const iconBox = isProvince ? 28 : 22
               const overlayTint =
                  isProvince && needsWhiteIcon(singleBaseColor)
                     ? '#FFFFFF'
                     : undefined
               const yOffset = isProvince ? -1 : undefined
               const svgUrl = getBaseMarkerSvgUrl(
                  singleBaseColor,
                  letter,
                  false,
                  isProvince,
                  opts
               )
               const canvas = await createMarkerIcon(
                  svgUrl,
                  singleIconOverlay,
                  iconBox,
                  yOffset,
                  overlayTint,
                  isProvince
               )
               const bitmap = await createImageBitmap(canvas)
               map.value?.addImage(id, bitmap, { pixelRatio: 1.5 })
            }

            if (matchedSuffix === '-cluster') {
               const clusterBaseColor = first.iconColor || first.color
               const clusterSvgUrl = getBaseMarkerSvgUrl(
                  clusterBaseColor,
                  letter,
                  false,
                  false
               )
               const clusterOverlayUrl = isProvince
                  ? getIconForStationType('PROVINCE_BZ')
                  : undefined
               const clusterYOffset = isProvince ? -4 : undefined
               const clusterTint = isProvince ? '#FFFFFF' : undefined
               const clusterCanvas = await createMarkerIcon(
                  clusterSvgUrl,
                  clusterOverlayUrl,
                  24,
                  clusterYOffset,
                  clusterTint,
                  false
               )
               const clusterBitmap = await createImageBitmap(clusterCanvas)
               map.value?.addImage(id, clusterBitmap, { pixelRatio: 1.5 })
               return
            }

            const opts = {
               selected: id.includes('-selected'),
               alarm: id.includes('-alarm'),
               inactive: id.includes('-inactive'),
            }
            await buildSingleIcon(opts)
         } catch (_) {
            // noop
         } finally {
            if (evt?.id) missingImageInFlight.delete(evt.id)
         }
      })

      const emitBounds = (reason: 'load' | 'moveend' | 'zoomend') => {
         if (!map.value) return
         const b = map.value.getBounds()
         emit('boundsChanged', {
            bounds: {
               west: b.getWest(),
               south: b.getSouth(),
               east: b.getEast(),
               north: b.getNorth(),
            },
            zoom: map.value.getZoom(),
            reason,
         })
      }

      emitBounds('load')
      map.value?.on('moveend', () => emitBounds('moveend'))
      map.value?.on('zoomend', () => emitBounds('zoomend'))
   })
})

watch(
   () => props.selectedScode,
   (curr, prev) => {
      localSelected.value = curr
      syncSelectedToSources(curr, prev)
   }
)

watch(
   () => props.focusScode,
   (curr) => {
      const marker = props.markers?.find((m) => m.scode === curr)
      if (marker) {
         handleMarkerSelected(marker)
      }
   }
)

watch(
   () =>
      [
         props.markers,
         mapLoaded.value,
         props.selectedScode,
         showAlarms.value,
      ] as [
         DataMarker[] | undefined,
         boolean | undefined,
         string | undefined,
         boolean,
      ],
   async ([currentProps, currentMapLoaded, currentSelectedScode]) => {
      if (preventMapUpdate.value) return

      // Avoid re-render loops: only refresh when markers/selection actually changed.
      if (
         lastRenderedMarkers.value === currentProps &&
         lastRenderedSelected.value === currentSelectedScode &&
         lastRenderedShowAlarms.value === showAlarms.value
      ) {
         preventMapUpdate.value = false
         return
      }

      if (currentMapLoaded) {
         setRendering(true)
         stationMarkers.value = {}

         const hasPseudoClusters = (currentProps || []).some(
            (m: any) => (m as any).pseudoCluster
         )

         const markersToRender =
            hasPseudoClusters || (currentProps?.length || 0) > 5000
               ? currentProps
               : currentProps
                    ?.slice()
                    .sort(
                       (p1: DataMarker, p2: DataMarker) =>
                          p2.coordinates[1] - (p1.coordinates[1] || 0)
                    )

         markersToRender?.forEach((data: DataMarker) => {
            const arr = stationMarkers.value[data.stype] || []
            arr.push({
               scode: data.scode,
               color: data.color,
               iconColor: data.iconColor,
               stype: data.stype,
               coordinates: data.coordinates,
               alarm: showAlarms.value ? data.alarm : false,
               inactive: data.inactive,
               recent: data.recent,
               infoColor: showAlarms.value ? data.infoColor : undefined,
            })
            stationMarkers.value[data.stype] = arr
         })

         if (props.markers?.length) {
            await setMapClusterSource()
         } else {
            await clearCurrentClusterSource()
         }

         // Ensure selected state is applied after sources are (re)created.
         syncSelectedToSources(props.selectedScode)

         lastRenderedMarkers.value = currentProps
         lastRenderedSelected.value = currentSelectedScode
         lastRenderedShowAlarms.value = showAlarms.value
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
