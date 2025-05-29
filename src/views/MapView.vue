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
   getMaxHoursForInfoIcon,
} from '../utils/map-utils'

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
      if (!oldVal.stype || newVal.stype !== oldVal.stype) {
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

const refetchForDataTypeWithFilters = async (newVal: SelectedFilterOrigins) => {
   const layer = layerStore.getSelectedLayers.find((l) =>
      l.stationType.includes(newVal.stype)
   )
   if (!layer || !newVal.sorigin[newVal.stype]) {
      return
   }

   let filterString = newVal.sorigin[newVal.stype]
      .map((s) => `sorigin.ire.${s}`)
      .join(',')

   if (newVal.sorigin[newVal.stype].length > 1) {
      filterString = `or(${filterString})`
   }

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
            { scode: string; mvalidtime: string }[]
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

            if (!isProvinceEvents && !fetchedEvents[stype]) {
               fetchedEvents[stype] = JSON.parse(
                  (
                     await useFetch(
                        `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,${datasetType}/${typedDataPoint.stype}/*/${subHours(now, getMaxHoursForInfoIcon(typedDataPoint.stype)).toISOString()}/${now.toISOString()}?select=scode,mvalidtime&limit=-1`
                     ).text()
                  ).data.value || '{}'
               ).data
            }

            const scode = isProvinceEvents
               ? typedEventPoint.evuuid
               : typedDataPoint.scode
            const lastEvent = !isProvinceEvents
               ? fetchedEvents[stype]?.findLast((e) => e.scode === scode)
               : undefined
            const lastDiffHours = lastEvent?.mvalidtime
               ? differenceInHours(now, new Date(lastEvent.mvalidtime))
               : undefined
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
                  : lastDiffHours === undefined
                    ? 'grey'
                    : getInfoMarkerColorDifferenceThreshold(
                         stype,
                         lastDiffHours
                      ),

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
      newMarkers.push(...((await fetchStationData(layer)) || []))
      await nextTick()
   }

   markers.value = newMarkers

   loading.value -= 1
}

const setLayersToMap = async (curr: Layer[], old: Layer[]) => {
   loading.value += 1

   const arrayDiff = useArrayDifference(curr, old, (a, b) => a.id === b.id)
   const latestSelected = arrayDiff.value[0]

   if (latestSelected && curr.length > old.length) {
      const newMarkers = await fetchStationData(latestSelected)
      const uniquePoints = new Set(markers.value.map((p) => p.scode))

      if (newMarkers) {
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
         markers.value = markers.value.filter((p) => p.stype !== d)
         delete uniqueOrigins.value[d]
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

onMounted(() => {
   if (lastMarkersSet.value.length > 0) {
      markers.value = lastMarkersSet.value
   }
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
