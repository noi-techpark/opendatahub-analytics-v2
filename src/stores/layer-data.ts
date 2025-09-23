// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AlarmConfig } from '../types/alarm-config'
import type { DataMarker } from '../types/api'

export const useLayerDataStore = defineStore('layer-data', () => {
  // Shared alarm configuration across views
  const alarmConfig = ref<AlarmConfig>({})

  // Shared markers and origins cache to persist across navigation
  const markers = ref<DataMarker[]>([])
  const uniqueOrigins = ref<Record<string, Set<string>>>({})
  const lastMarkersSet = ref<DataMarker[]>([])

  // Simple loading flag for shared operations (can be expanded later)
  const loading = ref<number>(0)

  const setAlarmConfig = (config: AlarmConfig) => {
    alarmConfig.value = config || {}
  }

  const setMarkers = (m: DataMarker[]) => {
    markers.value = m || []
  }

  const setUniqueOrigins = (map: Record<string, Set<string>>) => {
    uniqueOrigins.value = map || {}
  }

  const setLastMarkersSet = (m: DataMarker[]) => {
    lastMarkersSet.value = m || []
  }

  const incLoading = () => (loading.value += 1)
  const decLoading = () => (loading.value = Math.max(0, loading.value - 1))

  return {
    // state
    alarmConfig,
    markers,
    uniqueOrigins,
    lastMarkersSet,
    loading,
    // actions
    setAlarmConfig,
    setMarkers,
    setUniqueOrigins,
    setLastMarkersSet,
    incLoading,
    decLoading,
  }
})
