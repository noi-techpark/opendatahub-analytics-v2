import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import layers from '../assets/map/layers-config.json'
import { MapLayer } from '../types/map-layer.js'

export const useLayerStore = defineStore('layers', () => {
  const allLayers = ref(layers as MapLayer)
  const selectedLayers = ref<{ [key: string]: boolean }>({})

  const getAllLayers = computed(() => allLayers.value)

  const getSelectedCount = computed(
    () => Object.values(selectedLayers.value).filter(Boolean).length
  )

  const getSelectedLayers = computed(() =>
    Object.entries(selectedLayers.value)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key)
      .map((i) => {
        const idx = i.split('-')
        return layers[Number(idx[0])].layers[Number(idx[1])]
      })
  )

  const getLayerKey = (i: number, j: number) => `${i}-${j}`

  function initializeLayers(layers: any[]) {
    const initialState: { [key: string]: boolean } = {}

    layers.forEach((item, i) => {
      item.layers.forEach((_: any, j: number) => {
        initialState[getLayerKey(i, j)] = false
      })
    })

    selectedLayers.value = initialState
  }

  function toggleLayer(i: number, j: number) {
    const key = getLayerKey(i, j)
    selectedLayers.value[key] = !selectedLayers.value[key]
  }

  function setLayerState(i: number, j: number, state: boolean) {
    const key = getLayerKey(i, j)
    selectedLayers.value[key] = state
  }

  function deselectAllInGroup(groupIndex: number) {
    Object.keys(selectedLayers.value)
      .filter((key) => key.startsWith(`${groupIndex}-`))
      .forEach((key) => {
        selectedLayers.value[key] = false
      })
  }

  function deselectAll() {
    Object.keys(selectedLayers.value).forEach((key) => {
      selectedLayers.value[key] = false
    })
  }

  function isLayerSelected(i: number, j: number): boolean {
    const key = getLayerKey(i, j)
    return selectedLayers.value[key] ?? false
  }

  function isAnyInGroupSelected(groupIndex: number): boolean {
    return Object.keys(selectedLayers.value)
      .filter((key) => key.startsWith(`${groupIndex}-`))
      .some((key) => selectedLayers.value[key])
  }

  return {
    getAllLayers,
    getSelectedLayers,
    getSelectedCount,

    initializeLayers,
    toggleLayer,
    setLayerState,
    deselectAllInGroup,
    deselectAll,
    isLayerSelected,
    isAnyInGroupSelected,
  }
})
