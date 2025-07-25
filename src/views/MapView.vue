<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="map-view">
      <div class="map-filters-ct">
         <MapFilter
            :title="t('common.dataprovider')"
            :value="totalOriginsFilters.toString()"
            :disabled="Object.keys(uniqueOrigins).length === 0"
            @click="setCurrentFilter('origin')"
         />
      </div>

      <MapOriginFilterCard
         v-if="currentFilter === 'origin'"
         @close="setCurrentFilter('')"
      />
      <MarkerCard
         v-if="selectedMarker && selectedScode"
         :key="selectedMarker.scode"
         :marker="selectedMarker"
         @close="handleSelectMarker()"
      />
   </main>
   <Map
      class="map-ct"
      :loading="loading > 0"
      :markers
      :selectedScode
      @markerSelected="handleSelectMarker"
   />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useMapLayerStore } from '../stores/map-layers'
import { useArrayDifference, useFetch } from '@vueuse/core'
import { DataMarker, DataPoint, EventPoint } from '../types/api'
import MapOriginFilterCard from '../components/ui/map/MapOriginFilterCard.vue'
import MarkerCard from '../components/ui/MarkerCard.vue'
import MapFilter from '../components/ui/map/MapFilter.vue'
import {
   MapMarkerDetails,
   Layer,
   SelectedFilterOrigins,
} from '../types/map-layer'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useNotificationsStore } from '../stores/notifications'
import { watchDebounced } from '@vueuse/core'
import { differenceInHours, subHours } from 'date-fns'
import {
   getInfoMarkerColorDifferenceThreshold,
   infoIconHoursThresholds,
} from '../utils/marker-alert-utils'
import { updateUrlQueryParams, getUrlQueryParams } from '../utils/url-query'

const { showNotification } = useNotificationsStore()

const { t } = useI18n()
const layerStore = useMapLayerStore()
const loading = ref<number>(0)
const markers = ref<DataMarker[]>([])
const selectedScode = ref<string>()
const selectedMarker = ref<MapMarkerDetails>()
const { isTogglingAll, uniqueOrigins, selectedFilterOrigins, lastMarkersSet } =
   storeToRefs(layerStore)
const lastLayers = ref<Layer[]>([])
const currentFilter = ref<string>('')

const isInitialLoad = ref<boolean>(true)
const isRestoringFromSessionStorage = ref<boolean>(false)

const totalOriginsFilters = computed(
   () => Object.values(selectedFilterOrigins.value.sorigin).flat().length
)

const handleSelectMarker = async (data?: MapMarkerDetails) => {
   selectedScode.value = data?.scode
   selectedMarker.value = data
   layerStore.selectMarker(data)
}

const setCurrentFilter = (filter: string) => {
   currentFilter.value = filter
}

watchDebounced(
   selectedFilterOrigins,
   (newVal, oldVal) => {
      if (
         (!isInitialLoad.value && !oldVal.stype) ||
         newVal.stype !== oldVal.stype
      ) {
         return
      }

      if (!isInitialLoad.value) {
         updateUrlWithStoreValues(newVal)
      }

      if (isRestoringFromSessionStorage.value) {
         return
      }

      refetchForDataTypeWithFilters(newVal)
   },
   { deep: true, debounce: 500, maxWait: 1000 }
)

watch(
   () => layerStore.getSelectedLayers,
   async (curr, old) => {
      if (isTogglingAll.value) {
         return
      }

      if (!isInitialLoad.value) {
         updateUrlWithSelectedLayers(curr)
      }

      setLayersToMap(curr, old)
   },
   { deep: true }
)

watch(isTogglingAll, (newVal) => {
   if (newVal) {
      lastLayers.value = [...layerStore.getSelectedLayers]
      return
   }

   const arrayDiff = useArrayDifference(
      layerStore.getSelectedLayers,
      lastLayers.value,
      (a, b) => a.id === b.id
   )

   if (arrayDiff.value.length > 0) {
      toggleAllLayers(arrayDiff.value)
   } else {
      markers.value = []
      uniqueOrigins.value = {}
   }
})

watch(
   markers,
   (newVal) => {
      lastMarkersSet.value = newVal
   },
   { deep: true }
)

const buildOriginFilterString = (origins: string[]): string => {
   if (!origins || origins.length === 0) return ''

   const filterParts = origins.map((origin) => `sorigin.ire.${origin}`)
   const filterString = filterParts.join(',')

   return origins.length > 1 ? `or(${filterString})` : filterString
}

const refetchForDataTypeWithFilters = async (newVal: SelectedFilterOrigins) => {
   const layer = layerStore.getSelectedLayers.find((l) =>
      l.stationType.includes(newVal.stype)
   )
   if (!layer || !newVal.sorigin[newVal.stype]) {
      return
   }

   const filterString = buildOriginFilterString(newVal.sorigin[newVal.stype])

   markers.value = markers.value.filter(
      (marker) => marker.stype !== newVal.stype
   )

   const newMarkers = await fetchStationData(layer, {
      stype: newVal.stype,
      filterString,
   })

   if (!newMarkers) {
      return
   }

   markers.value = newMarkers
}

const fetchStationData = async (
   layer: Layer,
   filter?: { stype: string; filterString: string }
) => {
   try {
      const isProvinceEvents = layer.id === 'Traffic Events'

      const currentMarkers = filter?.filterString
         ? [...markers.value.filter((item) => item.stype !== filter.stype)]
         : [...markers.value]
      const newMarkers: DataMarker[] = []
      let datasetType = 'node'
      const activeQuery = 'sactive.eq.true'
      let query = 'select=scoordinate%2Cscode%2Cstype%2Csorigin&where='
      if (isProvinceEvents) {
         datasetType = 'event'
         query = ''
      }

      if (filter?.filterString) {
         query += `and(${activeQuery},${filter.filterString})`
      } else {
         query += activeQuery
      }

      const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,${datasetType}/${isProvinceEvents ? 'PROVINCE_BZ/' + new Date().toISOString() : layer.stationType}/?limit=-1&distinct=true&${query}`

      const flatData = isProvinceEvents
         ? (JSON.parse((await useFetch(url).text()).data.value || '{}')
              .data as EventPoint[])
         : (JSON.parse((await useFetch(url).text()).data.value || '{}')
              .data as DataPoint[])

      if (flatData && flatData.length > 0) {
         const now = new Date()
         const fetchedEvents: Record<
            string,
            Record<
               string,
               {
                  stations: Record<
                     string,
                     {
                        sdatatypes: Record<
                           string,
                           {
                              tmeasurements: Array<{
                                 mperiod: number
                                 mvalidtime: string
                                 mvalue: number
                              }>
                           }
                        >
                     }
                  >
               }
            >
         > = {}

         const newPoints: DataMarker[] = []
         for (const d of flatData) {
            const typedDataPoint = d as DataPoint
            const typedEventPoint = d as EventPoint
            const stype = isProvinceEvents
               ? `PROVINCE_BZ/${typedEventPoint.evmetadata?.subTycodeValue}`
               : typedDataPoint.stype
            if (!uniqueOrigins.value[stype]) {
               uniqueOrigins.value[stype] = new Set()
            }
            const origin = isProvinceEvents
               ? 'PROVINCE_BZ'
               : typedDataPoint.sorigin
            uniqueOrigins.value[stype].add(origin)

            if (
               isProvinceEvents &&
               filterProvinceBZEvent(typedEventPoint, now)
            ) {
               continue
            }

            const fetchedEventsKey = Array.isArray(layer.stationType)
               ? layer.stationType.join('_')
               : layer.stationType
            if (!isProvinceEvents && !fetchedEvents[fetchedEventsKey]) {
               let query_where_datatypes = ''
               let datatype_period_duplicates: Record<string, boolean> = {}

               if (infoIconHoursThresholds[typedDataPoint.stype]) {
                  for (const tnameKey in infoIconHoursThresholds[
                     typedDataPoint.stype
                  ]) {
                     for (const mperiodKey in infoIconHoursThresholds[
                        typedDataPoint.stype
                     ][tnameKey]) {
                        const duplicatesKey = tnameKey + '_' + mperiodKey
                        if (!datatype_period_duplicates[duplicatesKey]) {
                           datatype_period_duplicates[duplicatesKey] = true
                           let query_datatype =
                              'and(mperiod.eq.' +
                              mperiodKey +
                              ',tname.eq."' +
                              tnameKey.replace(/(['"\(\)\\])/g, '\\$1') +
                              '")'
                           query_where_datatypes +=
                              (query_where_datatypes === '' ? 'or(' : ',') +
                              query_datatype
                        }
                     }
                  }
               }

               if (query_where_datatypes) {
                  query_where_datatypes += ')'
                  try {
                     const response = await useFetch(
                        `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${layer.stationType}/*/latest?limit=-1&distinct=true&select=tmeasurements&showNull=true&where=${encodeURIComponent(query_where_datatypes)}`
                     )

                     const parsedResponse = JSON.parse(
                        (response.data.value as string) || '{}'
                     )
                     fetchedEvents[fetchedEventsKey] =
                        parsedResponse?.data || {}
                  } catch (error) {
                     console.error(
                        `Error fetching data for ${fetchedEventsKey}:`,
                        error
                     )
                     fetchedEvents[fetchedEventsKey] = {}
                  }
               } else {
                  fetchedEvents[fetchedEventsKey] = {}
               }
            }

            const scode = isProvinceEvents
               ? typedEventPoint.evuuid
               : typedDataPoint.scode

            let lastDiffHours = undefined
            let lastMeasurement = undefined

            if (
               !isProvinceEvents &&
               fetchedEvents[fetchedEventsKey] &&
               fetchedEvents[fetchedEventsKey][stype] &&
               fetchedEvents[fetchedEventsKey][stype].stations &&
               fetchedEvents[fetchedEventsKey][stype].stations[scode]
            ) {
               const station =
                  fetchedEvents[fetchedEventsKey][stype].stations[scode]

               for (const dataType in station.sdatatypes) {
                  const measurements =
                     station.sdatatypes[dataType].tmeasurements
                  if (measurements && measurements.length > 0) {
                     const measurement = measurements[0]
                     if (measurement.mvalidtime) {
                        const diffHours = differenceInHours(
                           now,
                           new Date(measurement.mvalidtime)
                        )

                        if (
                           lastDiffHours === undefined ||
                           diffHours < lastDiffHours
                        ) {
                           lastDiffHours = diffHours
                           lastMeasurement = { ...measurement, dataType }
                        }
                     }
                  }
               }
            }

            newPoints.push({
               scode,
               sname: isProvinceEvents
                  ? typedEventPoint.evname
                  : typedDataPoint.sname,
               color: layer.color,
               iconColor: layer.iconColor,
               stype,
               coordinates: isProvinceEvents
                  ? typedEventPoint.evlgeometry.coordinates
                  : [
                       typedDataPoint.scoordinate?.x || 0,
                       typedDataPoint.scoordinate?.y || 0,
                    ],
               infoColor: isProvinceEvents
                  ? undefined
                  : lastMeasurement
                    ? getInfoMarkerColorDifferenceThreshold(
                         stype,
                         lastMeasurement.dataType,
                         lastMeasurement.mperiod,
                         Number(lastMeasurement.mvalue),
                         lastDiffHours || 0
                      )
                    : undefined,

               eventData: isProvinceEvents ? typedEventPoint : undefined,
            })
         }

         const uniquePoints = new Set(currentMarkers.map((p) => p.scode))
         newMarkers.push(
            ...currentMarkers,
            ...newPoints.filter((point) => !uniquePoints.has(point.scode))
         )
      } else {
         showNotification({
            type: 'error',
            message: t('views.map.noDataFor', {
               name: layer.stationType.join(', '),
            }),
         })
      }

      return newMarkers
   } catch (err) {
      console.error('An error occurred while processing the data:', err)
   }
}

const toggleAllLayers = async (layers: Layer[]) => {
   loading.value += 1

   const newMarkers: DataMarker[] = []

   for (const layer of layers) {
      const stationTypes = Array.isArray(layer.stationType)
         ? layer.stationType
         : [layer.stationType]

      let hasFilters = false
      let filteredStationTypes: string[] = []

      for (const stype of stationTypes) {
         if (selectedFilterOrigins.value.sorigin[stype]?.length > 0) {
            hasFilters = true
            filteredStationTypes.push(stype)
         }
      }

      if (hasFilters) {
         for (const stype of filteredStationTypes) {
            const filterStrings = Object.entries(
               selectedFilterOrigins.value.sorigin
            )
               .filter(([key]) => stationTypes.includes(key))
               .map(([key, values]) => buildOriginFilterString(values))
            const filterString = filterStrings.join(',')

            const stypeFilteredMarkers = await fetchStationData(layer, {
               stype,
               filterString,
            })

            if (stypeFilteredMarkers) {
               newMarkers.push(...stypeFilteredMarkers)
            }
         }

         const unfilteredTypes = stationTypes.filter(
            (stype) => !filteredStationTypes.includes(stype)
         )
         if (unfilteredTypes.length > 0) {
            const unfilteredLayer = {
               ...layer,
               stationType: unfilteredTypes,
            }

            const unfilteredMarkers = await fetchStationData(unfilteredLayer)
            if (unfilteredMarkers) {
               newMarkers.push(...unfilteredMarkers)
            }
         }
      } else {
         const unfilteredMarkers = await fetchStationData(layer)
         if (unfilteredMarkers) {
            newMarkers.push(...unfilteredMarkers)
         }
      }

      await nextTick()
   }

   markers.value = newMarkers

   if (!isInitialLoad.value) {
      updateUrlWithSelectedLayers(layers)
   }

   loading.value -= 1
}

const setLayersToMap = async (curr: Layer[], old: Layer[]) => {
   loading.value += 1

   const arrayDiff = useArrayDifference(curr, old, (a, b) => a.id === b.id)
   const latestSelected = arrayDiff.value[0]

   if (latestSelected && curr.length > old.length) {
      const stationTypes = Array.isArray(latestSelected.stationType)
         ? latestSelected.stationType
         : [latestSelected.stationType]
      let hasAppliedFilter = false
      let newMarkers: DataMarker[] = []

      for (const stype of stationTypes) {
         if (selectedFilterOrigins.value.sorigin[stype]?.length > 0) {
            const filterString = buildOriginFilterString(
               selectedFilterOrigins.value.sorigin[stype]
            )

            const filteredMarkers = await fetchStationData(latestSelected, {
               stype,
               filterString,
            })

            if (filteredMarkers) {
               newMarkers = [...newMarkers, ...filteredMarkers]
               hasAppliedFilter = true
            }
         }
      }

      if (!hasAppliedFilter) {
         const unfilteredMarkers = await fetchStationData(latestSelected)
         if (unfilteredMarkers) {
            newMarkers = [...newMarkers, ...unfilteredMarkers]
         }
      }

      const uniquePoints = new Set(markers.value.map((p) => p.scode))

      if (newMarkers.length > 0) {
         markers.value = [
            ...markers.value,
            ...newMarkers.filter((point) => !uniquePoints.has(point.scode)),
         ]
      }
   } else {
      const newTypes = new Set(curr.flatMap((n) => n.stationType))
      const oldTypes = old.flatMap((o) => o.stationType)
      const diff = oldTypes.filter((ot) => !newTypes.has(ot))

      diff.forEach((d) => {
         const isProvinceBZ = d === 'PROVINCE_BZ'

         markers.value = isProvinceBZ
            ? markers.value.filter((p) => !p.stype.startsWith(d))
            : markers.value.filter((p) => p.stype !== d)

         if (isProvinceBZ) {
            const keysToRemove = Object.keys(uniqueOrigins.value).filter((k) =>
               k.startsWith(d)
            )
            keysToRemove.forEach((k) => delete uniqueOrigins.value[k])
         } else {
            delete uniqueOrigins.value[d]
         }
      })
   }

   loading.value -= 1
}

// returns true, if PROVINCE_BZ event should NOT be visible on the map
const filterProvinceBZEvent = (event: EventPoint, date: Date) => {
   if (event.evorigin !== 'PROVINCE_BZ') return false

   const startTs = new Date(event.evstart).getTime()
   const endTs = new Date(event.evend).getTime()
   const category = event.evcategory
   const now = date.getTime()
   // use 00:00:00 for check if event today
   const startDayTs = new Date(event.evstart).setHours(0, 0, 0, 0)
   const todayTs = date.setHours(0, 0, 0, 0)

   switch (category) {
      case 'intralci viabilità in e fuori Alto Adige_chiusura temporanea | Verkehrsbehinderung für Zonen und aus. Südt._kurzfristige oder zeitweilige Sperre':
         if (endTs === null || endTs === undefined) return false
         return now <= startTs && now >= endTs
      case 'intralci viabilità in e fuori Alto Adige_cantiere | Verkehrsbehinderung für Zonen und aus. Südt._Baustelle':
         return now <= startTs && now >= endTs
      case 'intralci viabilità in e fuori Alto Adige_attenzione | Verkehrsbehinderung für Zonen und aus. Südt._Vorsicht':
      case 'intralci viabilità in e fuori Alto Adige_caduta frana | Verkehrsbehinderung für Zonen und aus. Südt._Murenabgang und Strassenverlegung':
      case 'intralci viabilità in e fuori Alto Adige_manifestazione | Verkehrsbehinderung für Zonen und aus. Südt._Veranstaltungen':
      case 'intralci viabilità in e fuori Alto Adige_senso unico alternato con semafero | Verkehrsbehinderung für Zonen und aus. Südt._Ampelregelung':
         return startDayTs !== todayTs
      default:
         if (category.includes('Situazione attuale'))
            return startDayTs !== todayTs
         return false
   }
}

const updateUrlWithStoreValues = (filterOrigins: SelectedFilterOrigins) => {
   const params: Record<string, string | null> = {}

   params['stype'] = filterOrigins.stype || null

   if (filterOrigins.sorigin && Object.keys(filterOrigins.sorigin).length > 0) {
      params['origins'] = JSON.stringify(filterOrigins.sorigin)
   } else {
      params['origins'] = null
   }

   if (uniqueOrigins.value && Object.keys(uniqueOrigins.value).length > 0) {
      const serializableOriginOptions: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(uniqueOrigins.value)) {
         serializableOriginOptions[key] = Array.from(value)
      }
      params['originOptions'] = JSON.stringify(serializableOriginOptions)
   } else {
      params['originOptions'] = null
   }

   updateUrlQueryParams(params)
}

const updateUrlWithSelectedLayers = (layers: Layer[]) => {
   const params: Record<string, string | null> = {}

   if (layers.length > 0) {
      params['layers'] = layers.map((layer) => layer.id).join(',')
   } else {
      params['layers'] = null
   }

   updateUrlQueryParams(params)
}

const loadQueryParamsIntoStore = async () => {
   const params = getUrlQueryParams([
      'stype',
      'origins',
      'layers',
      'originOptions',
   ])
   const layersToLoad: Layer[] = []

   if (params.stype) {
      let parsedOrigins: Record<string, string[]> = {}

      if (params.origins) {
         try {
            parsedOrigins = JSON.parse(params.origins)
         } catch (e) {
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

   if (params.layers) {
      const layerIds = params.layers.split(',')
      const allLayers = layerStore.getAllLayers

      layerIds.forEach((layerId) => {
         allLayers.forEach((layerGroup, groupIndex) => {
            layerGroup.layers.forEach((layer, layerIndex) => {
               if (layer.id === layerId) {
                  layerStore.setLayerState(layerGroup.id, layerIndex, true)
                  layersToLoad.push(layer)
               }
            })
         })
      })

      if (layersToLoad.length > 0) {
         await toggleAllLayers(layersToLoad)
      }
   }

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

   if (
      selectedFilterOrigins.value.sorigin &&
      Object.keys(selectedFilterOrigins.value.sorigin).length > 0
   ) {
      for (const layer of layersToLoad) {
         const stationTypes = Array.isArray(layer.stationType)
            ? layer.stationType
            : [layer.stationType]

         for (const stype of stationTypes) {
            if (selectedFilterOrigins.value.sorigin[stype]?.length > 0) {
               const tempFilterOrigins = {
                  stype,
                  sorigin: selectedFilterOrigins.value.sorigin,
               }
               await refetchForDataTypeWithFilters(tempFilterOrigins)
            }
         }
      }

      if (
         params.stype &&
         selectedFilterOrigins.value.sorigin[params.stype]?.length > 0
      ) {
         const isHandled = layersToLoad.some((layer) => {
            const stationTypes = Array.isArray(layer.stationType)
               ? layer.stationType
               : [layer.stationType]
            return stationTypes.includes(params.stype as string)
         })

         if (!isHandled) {
            await refetchForDataTypeWithFilters(selectedFilterOrigins.value)
         }
      }
   }
}

onMounted(async () => {
   markers.value = []

   const storedParams = sessionStorage.getItem('odh_map_query_params')
   const currentSearchString = new URLSearchParams(
      window.location.search
   ).toString()

   if (storedParams && storedParams !== currentSearchString) {
      isRestoringFromSessionStorage.value = true
   }

   await loadQueryParamsIntoStore()

   if (markers.value.length === 0 && layerStore.getSelectedLayers.length > 0) {
      await toggleAllLayers(layerStore.getSelectedLayers)
   }

   nextTick(() => {
      isInitialLoad.value = false

      setTimeout(() => {
         isRestoringFromSessionStorage.value = false
      }, 1000)
   })
})
</script>

<style lang="postcss" scoped>
.map-view {
   @apply relative z-10 w-fit;

   & .map-filters-ct {
      @apply z-20 mb-2 flex gap-2 py-1;
   }
}

.map-ct {
   @apply absolute inset-0 z-0 h-full w-full;
}

@media (max-width: theme('screens.md')) {
   .map-view {
   }
}
</style>
