// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TimeSeries } from '../types/time-series'

export const useTimeSeriesStore = defineStore('time-series', () => {
   // State
   const colors = [
      '#114189',
      '# 9a5dd',
      '#757fa0',
      '#66e266',
      '#27fd10',
      '#5df6f8',
      '#f11c6b',
      '#2e9bc1',
      '#6868f1',
      '#aa147f',
      '#80c5d0',
      '#59cd56',
      '# c806f',
      '#9f81cd',
      '#2695ef',
      '#939bc6',
      '#cee390',
      '#4daeda',
      '#50e449',
      '#89e139',
      '#ef9196',
      '#f74991',
      '#c71bb9',
      '#ae1319',
      '#f988a7',
      '#4df2a0',
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
      'provider',
      'dataset',
      'station',
      'datatype',
      'period',
      'color',
   ]

   const timeSeriesList = ref<TimeSeries[]>([
      {
         id: '5eda50aa-3c59-42be-8218-b19cb1defb8d',
         provider: 'Municipality Bolzano',
         dataset: 'ParkingStation',
         station: 'TURIST-PARKING',
         datatype: 'free',
         period: '300',
         color: '#114189',
         data: [
            369, 368, 369, 370, 370, 370, 370, 370, 370, 370, 370, 370, 370,
            370, 369, 368, 367, 366, 365, 366, 365, 364, 363, 362, 361, 360,
            359, 360, 359, 358, 357, 356, 355, 354, 353, 352, 353, 352, 351,
            350, 349, 348, 349, 348, 347, 346, 347, 346, 345, 344, 343, 342,
            341, 342, 341, 342, 343, 342, 343, 344, 345, 344, 343, 342, 343,
            342, 341, 340, 339, 338, 339, 338, 337, 336, 337, 336, 337, 336,
            335, 334, 335, 334, 333, 332, 331, 330, 329, 328, 327, 328, 327,
            328, 327, 326, 325, 324, 323, 322, 323, 324, 323, 324, 325, 324,
            325, 326, 327, 326, 325, 324, 323, 322, 321, 321, 321, 322, 323,
            324, 325, 324, 325, 324, 325, 326, 327, 328, 329, 330, 331, 332,
            331, 332, 333, 332, 333, 334,
         ],
      },
   ])

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
                  ? `${key}_${index}=${item[key]}`
                  : ''
            )
            .filter((item) => item)
            .join('&')
      })

      return data
   }

   return {
      timeSeriesList,
      colors,

      // Actions
      addTimeSeries,
      removeTimeSeries,

      // Getters
      getTimeSeriesForEmbedCode,
   }
})
