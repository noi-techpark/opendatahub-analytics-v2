// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TimeSeries } from '../types/time-series.js'

export const useTimeSeriesStore = defineStore('time-series', () => {
   // State
   const timeSeries = ref<TimeSeries>()

   // Getters
   const getAllSeries = computed(() => timeSeries.value)

   // Actions

   return {
      // Getters
      getAllSeries,

      // Actions
   }
})
