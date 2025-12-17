// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import layers from '../assets/map/layers-config.json'
import {
   MapLayer,
   MapMarkerDetails,
   SelectedFilterOrigins,
} from '../types/map-layer.js'
import { DataMarker } from '../types/api'

export const useMapLayerStore = defineStore('map-layers', () => {
   // State
   const allLayers = ref<MapLayer>(
      layers.filter((l) => l.id !== 'linear' && l.id !== 'maps') as MapLayer
   )
   const selectedLayers = ref<{ [key: string]: boolean }>({})
   const selectedLayerId = ref<string | null>(null)
   const selectedMarker = ref<MapMarkerDetails>()
   const isTogglingAll = ref<boolean>(false)
   const uniqueOrigins = ref<Record<string, Set<string>>>({}) // { [key: stype]: Set<sorigin> }
   const selectedFilterOrigins = ref<SelectedFilterOrigins>({
      stype: '',
      sorigin: {},
   })

   const lastMarkersSet = ref<DataMarker[]>([])
   const showAlarms = ref<boolean>(false)
   const hideInactiveSensors = ref<boolean>(false)

   // Getters
   const getAllLayers = computed(() => allLayers.value)
   const getAllLayersFlat = computed(() =>
      allLayers.value.flatMap((l) => l.layers)
   )

   const getSelectedLayer = computed(() =>
      allLayers.value.find((layer) => layer.id === selectedLayerId.value)
   )

   const getSelectedCount = computed(
      () => Object.values(selectedLayers.value).filter(Boolean).length
   )

   const getSelectedLayers = computed(() =>
      Object.entries(selectedLayers.value)
         .filter(([_, isSelected]) => isSelected)
         .map(([key]) => {
            const [layerId, layerIndex] = key.split('-')
            const layer = allLayers.value.find((l) => l.id === layerId)
            return layer?.layers[Number(layerIndex)]
         })
         .filter(
            (layer): layer is NonNullable<typeof layer> => layer !== undefined
         )
   )

   const getSelectedMarker = computed(() => selectedMarker.value)

   const getLayerKey = (layerId: string, index: number): string => {
      return `${layerId}-${index}`
   }

   // Actions

   const getLayerByStationType = (id: string) => {
      const layers = allLayers.value.map((l) => l.layers).flat()
      return layers.find((l) => l.stationType.includes(id))
   }

   const initializeLayers = () => {
      const initialState: { [key: string]: boolean } = {}
      allLayers.value.forEach((group) => {
         group.layers.forEach((_, index) => {
            initialState[getLayerKey(group.id, index)] = false
         })
      })
      selectedLayers.value = initialState

      // Default to the primary group 'stations' if available
      const hasStations = allLayers.value.some((g) => g.id === 'stations')
      selectedLayerId.value = hasStations
         ? 'stations'
         : allLayers.value[0]?.id || null
   }

   const selectLayer = (layerId: string) => {
      selectedLayerId.value = layerId
   }

   const toggleLayer = (layerId: string, index: number) => {
      const key = getLayerKey(layerId, index)
      selectedLayers.value[key] = !selectedLayers.value[key]
   }

   const setLayerState = (layerId: string, index: number, state: boolean) => {
      const key = getLayerKey(layerId, index)
      selectedLayers.value[key] = state
   }

   const isLayerSelected = (layerId: string, index: number): boolean => {
      const key = getLayerKey(layerId, index)
      return selectedLayers.value[key] ?? false
   }

   const areAllLayersInGroupSelected = (layerId: string): boolean => {
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return false

      return currentLayer.layers.every((_, index) =>
         isLayerSelected(layerId, index)
      )
   }

   const toggleAllInGroup = async (layerId: string) => {
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return

      isTogglingAll.value = true
      await nextTick()

      const shouldSelect = !areAllLayersInGroupSelected(layerId)
      currentLayer.layers.forEach(async (_, index) => {
         setLayerState(layerId, index, shouldSelect)
      })

      await nextTick()
      isTogglingAll.value = false
   }

   const deselectAll = () => {
      if (!selectedLayerId.value) return
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return

      currentLayer.layers.forEach((_, index) => {
         setLayerState(currentLayer.id, index, false)
      })
   }

   const selectMarker = (marker?: MapMarkerDetails) => {
      selectedMarker.value = marker
   }

   initializeLayers()

   return {
      // State
      isTogglingAll,
      uniqueOrigins,
      selectedFilterOrigins,
      lastMarkersSet,
      showAlarms,
      hideInactiveSensors,

      // Getters
      getAllLayers,
      getAllLayersFlat,
      getSelectedLayer,
      getSelectedCount,
      getSelectedLayers,
      getSelectedMarker,

      // Actions
      getLayerByStationType,
      selectLayer,
      selectMarker,
      toggleLayer,
      setLayerState,
      isLayerSelected,
      areAllLayersInGroupSelected,
      toggleAllInGroup,
      deselectAll,
   }
})
