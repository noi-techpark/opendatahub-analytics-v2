// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import layers from '../assets/map/layers-config.json'
import { MapLayer } from '../types/map-layer.js'
import { MapMarkerDetails } from '../types/api.js'

export const useLayerStore = defineStore('layers', () => {
   // State
   const allLayers = ref<MapLayer>(layers as MapLayer)
   const selectedLayers = ref<{ [key: string]: boolean }>({})
   const selectedLayerId = ref<string | null>(null)
   const selectedMarker = ref<MapMarkerDetails>()

   // Getters
   const getAllLayers = computed(() => allLayers.value)

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
         .filter((layer) => layer !== undefined)
   )

   const getSelectedMarker = computed(() => selectedMarker.value)

   function getLayerKey(layerId: string, index: number): string {
      return `${layerId}-${index}`
   }

   function initializeLayers() {
      const initialState: { [key: string]: boolean } = {}
      allLayers.value.forEach((group) => {
         group.layers.forEach((_, index) => {
            initialState[getLayerKey(group.id, index)] = false
         })
      })
      selectedLayers.value = initialState
      selectedLayerId.value = null
   }

   function selectLayer(layerId: string) {
      selectedLayerId.value = layerId
   }

   function toggleLayer(layerId: string, index: number) {
      const key = getLayerKey(layerId, index)
      selectedLayers.value[key] = !selectedLayers.value[key]
   }

   function setLayerState(layerId: string, index: number, state: boolean) {
      const key = getLayerKey(layerId, index)
      selectedLayers.value[key] = state
   }

   function isLayerSelected(layerId: string, index: number): boolean {
      const key = getLayerKey(layerId, index)
      return selectedLayers.value[key] ?? false
   }

   function areAllLayersInGroupSelected(layerId: string): boolean {
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return false

      return currentLayer.layers.every((_, index) =>
         isLayerSelected(layerId, index)
      )
   }

   function toggleAllInGroup(layerId: string) {
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return

      const shouldSelect = !areAllLayersInGroupSelected(layerId)
      currentLayer.layers.forEach((_, index) => {
         setLayerState(layerId, index, shouldSelect)
      })
   }

   function deselectAll() {
      if (!selectedLayerId.value) return
      const currentLayer = getSelectedLayer.value
      if (!currentLayer) return

      currentLayer.layers.forEach((_, index) => {
         setLayerState(currentLayer.id, index, false)
      })
   }

   function selectMarker(marker?: MapMarkerDetails) {
      selectedMarker.value = marker
   }

   // Initialize on store creation
   initializeLayers()

   return {
      // Getters
      getAllLayers,
      getSelectedLayer,
      getSelectedCount,
      getSelectedLayers,
      getSelectedMarker,

      // Actions
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
