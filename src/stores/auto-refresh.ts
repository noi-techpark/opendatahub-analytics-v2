// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAutoRefreshStore = defineStore('auto-refresh', () => {
   const isAutoRefreshEnabled = ref<boolean>(false)
   const refreshIntervalMs = ref<number>(60000) // 1 minute in milliseconds

   const lastRefreshTime = ref<Date | null>(null)
   const refreshTimerId = ref<number | null>(null)

   const formattedLastRefreshTime = computed(() => {
      if (!lastRefreshTime.value) return null
      return new Date(lastRefreshTime.value).toLocaleTimeString()
   })

   const toggleAutoRefresh = () => {
      isAutoRefreshEnabled.value = !isAutoRefreshEnabled.value

      if (isAutoRefreshEnabled.value) {
         startRefreshTimer()
      } else {
         stopRefreshTimer()
      }
   }

   const startRefreshTimer = () => {
      if (refreshTimerId.value !== null) {
         clearInterval(refreshTimerId.value)
      }

      lastRefreshTime.value = new Date()

      refreshTimerId.value = window.setInterval(() => {
         lastRefreshTime.value = new Date()
      }, refreshIntervalMs.value)
   }

   const stopRefreshTimer = () => {
      if (refreshTimerId.value !== null) {
         clearInterval(refreshTimerId.value)
         refreshTimerId.value = null
      }
   }

   const triggerManualRefresh = () => {
      lastRefreshTime.value = new Date()
   }

   return {
      // State
      isAutoRefreshEnabled,
      refreshIntervalMs,
      lastRefreshTime,

      // Computed
      formattedLastRefreshTime,

      // Actions
      toggleAutoRefresh,
      startRefreshTimer,
      stopRefreshTimer,
      triggerManualRefresh,
   }
})
