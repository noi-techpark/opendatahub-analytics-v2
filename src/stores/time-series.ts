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
      '#aa147f',
      '#80c5d0',
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
   ] as const

   const timeSeriesList = ref<TimeSeries[]>([])

   const hasToLoad = ref(false)

   // Actions
   const addTimeSeries = (timeSeries: TimeSeries) => {
      timeSeriesList.value.push(timeSeries)
   }

   const updateTimeSeries = (timeSeries: TimeSeries) => {
      const index = timeSeriesList.value.findIndex(
         (item) => item.id === timeSeries.id
      )
      timeSeriesList.value.splice(index, 1, timeSeries)
   }

   const deleteTimeSeries = (id: string) => {
      const index = timeSeriesList.value.findIndex((item) => item.id === id)
      timeSeriesList.value.splice(index, 1)
   }

   const getTimeSeriesForEmbedCode = () => {
      type EmbeddableKey = (typeof embeddableKeys)[number]

      const data = [...timeSeriesList.value].map((item, index) => {
         return (Object.keys(item) as (keyof typeof item)[])
            .filter((key): key is EmbeddableKey =>
               embeddableKeys.includes(key as EmbeddableKey)
            )
            .map((key) => {
               const value = item[key]
               return `${key}_${index}=${encodeURIComponent(
                  (value ?? '').toString()
               )}`
            })
            .join('&')
      })

      return data
   }

   const clearTimeSeriesList = () => {
      timeSeriesList.value = []
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
         data: [] as number[],
         labels: [] as string[],
      }
   }

   return {
      timeSeriesList,
      colors,
      embeddableKeys,
      hasToLoad,

      // Actions
      addTimeSeries,
      updateTimeSeries,
      deleteTimeSeries,
      clearTimeSeriesList,

      // Getters
      getTimeSeriesForEmbedCode,
      getBaseTimeSeriesObj,
   }
})
