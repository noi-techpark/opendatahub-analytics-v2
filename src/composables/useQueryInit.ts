// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { storeToRefs } from 'pinia'
import { useMapLayerStore } from '../stores/map-layers'
import { getUrlQueryParams, restoreQueryParamsFromSessionStorage, updateUrlQueryParams, saveQueryParamsToSessionStorage, getSessionStorageQueryParamsString } from '../utils/url-query'

/**
 * Initialize UI state from URL query parameters.
 * Currently centralizes the logic to:
 * - Optionally restore the last query string from sessionStorage when only a hash is used
 * - Parse the `layers` param and preselect matching layers in the store
 * - Select the first matched layer group to ensure sidebar content is visible
 */
export function useQueryInit() {
  const layerStore = useMapLayerStore()
  const { selectedFilterOrigins, uniqueOrigins } = storeToRefs(layerStore)

  const initLayersFromUrl = (opts?: { restoreSessionHash?: boolean }): string[] => {
    const { restoreSessionHash = false } = opts || {}

    if (restoreSessionHash) {
      restoreQueryParamsFromSessionStorage(window.location.hash)
    }

    const params = getUrlQueryParams(['layers'])
    const selectedIds: string[] = []

    if (params.layers) {
      const layerIds = params.layers.split(',')
      const allLayers = layerStore.getAllLayers
      let firstLayerGroupId: string | null = null

      layerIds.forEach((layerId) => {
        allLayers.forEach((layerGroup) => {
          layerGroup.layers.forEach((layer, layerIndex) => {
            if (layer.id === layerId) {
              layerStore.setLayerState(layerGroup.id, layerIndex, true)
              selectedIds.push(layerId)
              if (firstLayerGroupId === null) firstLayerGroupId = layerGroup.id
            }
          })
        })
      })

      if (firstLayerGroupId !== null) {
        layerStore.selectLayer(firstLayerGroupId)
      }
    }

    return selectedIds
  }

  /**
   * Initialize both layers and origin filters from URL query params.
   * - Restores session query when invoked with restoreSessionHash
   * - Parses and applies `layers`, `stype`, `origins`, and `originOptions`
   */
  const initFromUrl = (opts?: { restoreSessionHash?: boolean }) => {
    const { restoreSessionHash = false } = opts || {}
    if (restoreSessionHash) {
      restoreQueryParamsFromSessionStorage(window.location.hash)
    }

    const params = getUrlQueryParams(['layers', 'stype', 'origins', 'originOptions'])

    // Apply layers
    initLayersFromUrl()

    // Apply filter origins
    if (params.stype) {
      let parsedOrigins: Record<string, string[]> = {}
      if (params.origins) {
        try {
          parsedOrigins = JSON.parse(params.origins)
        } catch {
          const origins = params.origins.split(',')
          parsedOrigins = { [params.stype]: origins }
        }
      }
      selectedFilterOrigins.value = {
        stype: params.stype,
        sorigin: {
          ...parsedOrigins,
          ...selectedFilterOrigins.value.sorigin,
        },
      }
    }

    // Populate uniqueOrigins from originOptions if present
    if (params.originOptions) {
      try {
        const parsedOriginOptions = JSON.parse(params.originOptions)
        for (const [key, value] of Object.entries(parsedOriginOptions)) {
          if (!uniqueOrigins.value[key]) {
            uniqueOrigins.value[key] = new Set()
          }
          for (const origin of value as string[]) {
            uniqueOrigins.value[key].add(origin)
          }
        }
      } catch (e) {
        console.error('Failed to parse originOptions from URL', e)
      }
    }
  }

  /**
   * Save current selected layers and origins to URL query params.
   */
  const saveToUrl = () => {
    const params: Record<string, string | null> = {}

    // Layers
    const selectedLayers = layerStore.getSelectedLayers
    params['layers'] = selectedLayers.length > 0 ? selectedLayers.map((l) => l.id).join(',') : null

    // stype and origins
    params['stype'] = selectedFilterOrigins.value.stype || null
    if (selectedFilterOrigins.value.sorigin && Object.keys(selectedFilterOrigins.value.sorigin).length > 0) {
      params['origins'] = JSON.stringify(selectedFilterOrigins.value.sorigin)
    } else params['origins'] = null

    // originOptions (uniqueOrigins)
    if (uniqueOrigins.value && Object.keys(uniqueOrigins.value).length > 0) {
      const serializable: Record<string, string[]> = {}
      for (const [key, set] of Object.entries(uniqueOrigins.value)) {
        serializable[key] = Array.from(set)
      }
      params['originOptions'] = JSON.stringify(serializable)
    } else params['originOptions'] = null

    updateUrlQueryParams(params)
  }

  const saveSessionQuery = (params?: URLSearchParams) => {
    saveQueryParamsToSessionStorage(params)
  }

  const restoreSessionQuery = (hash?: string) => {
    restoreQueryParamsFromSessionStorage(hash || '')
  }

  const getStoredQueryString = (): string => {
    return getSessionStorageQueryParamsString()
  }

  const bootstrapFromUrl = async (opts?: { restoreSessionHash?: boolean; afterInit?: () => Promise<void> }) => {
    const { restoreSessionHash = false, afterInit } = opts || {}
    initFromUrl({ restoreSessionHash })
    if (afterInit) {
      await afterInit()
    }
  }

  return { initLayersFromUrl, initFromUrl, saveToUrl, saveSessionQuery, restoreSessionQuery, getStoredQueryString, bootstrapFromUrl }
}
