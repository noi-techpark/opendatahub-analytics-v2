// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TimeSeries } from '../types/time-series'
import { randomId } from '../components/utils/useRandomId'

export const useTimeSeriesStore = defineStore('time-series', () => {
   // State
   const colors = [
      '#114189',
      '#2695ef',
      '#f988a7',
      '#2e9bc1',
      '#9f81cd',
      '#6868f1',
      '#27fd10',
      '#ae1319',
      '#4df2a0',
      '#66e266',
      '#5df6f8',
      '#f11c6b',
      '#aa147f',
      '#80c5d0',
      '#59cd56',
      '# c806f',
      '#939bc6',
      '#cee390',
      '#4daeda',
      '#50e449',
      '#89e139',
      '#ef9196',
      '#f74991',
      '#c71bb9',

      '#3169c1',
      '#c60511',
      '#1876e5',
      '#c49162',
      '#cce418',
      '#18c9f2',
      '#156007',
      '#53c124',
      '#59e92a',
      '#ab0c73',
      '# 69f35',
      '#173583',
      '#c8d25b',
      '#599c0b',
      '#313e43',
      '#da4157',
      '#d67ad0',
      '#33674c',
      '#fda69a',
      '#15425f',
      '#cc4a9c',
      '#156ced',
      '#ef9b7e',
      '# f3f8d',
   ]

   const embeddableKeys = [
      'id',
      'provider',
      'dataset',
      'station',
      'datatype',
      'period',
      'color',
   ]

   const timeSeriesList = ref<TimeSeries[]>([])

   const hasToLoad = ref(false)

   // Actions
   const addTimeSeries = (timeSeries: TimeSeries) => {
      timeSeriesList.value.push(timeSeries)
   }

   const removeTimeSeries = (index: number) => {
      timeSeriesList.value = timeSeriesList.value.filter((_, i) => i !== index)
   }

   const getTimeSeriesForEmbedCode = () => {
      const data = [...timeSeriesList.value].map((item, index) => {
         return Object.keys(item)
            .map((key: string) =>
               embeddableKeys.includes(key)
                  ? `${key}_${index}=${encodeURIComponent(item[key])}`
                  : ''
            )
            .filter((item) => item)
            .join('&')
      })

      return data
   }

   const getBaseTimeSeriesObj = () => {
      return {
         id: randomId(),
         provider: '',
         dataset: '',
         station: '',
         datatype: '',
         period: '',
         color: colors[timeSeriesList.value.length],
         data: [],
         labels: [],
      }
   }

   return {
      timeSeriesList,
      colors,
      embeddableKeys,
      hasToLoad,

      // Actions
      addTimeSeries,
      removeTimeSeries,

      // Getters
      getTimeSeriesForEmbedCode,
      getBaseTimeSeriesObj,
   }
})
