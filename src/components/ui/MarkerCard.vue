<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="marker-card-component">
      <div class="marker-card-header">
         <div class="marker-title-ct">
            <H class="marker-title" tag="h2">{{ markerName }}</H>
         </div>
         <CloseIcon class="marker-close __clickable" @click="$emit('close')" />
      </div>
      <div class="marker-card-content">
         <Loader :active="isLoading" light />
         <MenuButtons class="sticky" :links :selected-id="selectedId" />
         <div
            v-if="selectedId === 'metadata'"
            class="metadata-ct"
            :class="{ 'no-data': !hasMetadata }"
         >
            <ul
               v-if="hasMetadata && hasMandatoryMetadata"
               class="metadata-list"
            >
               <li
                  v-for="item in Object.entries(data?.metadata || {})"
                  class="metadata-item"
               >
                  <P bold class="capitalize">{{ item[0] }}:</P>
                  <P>{{ item[1] }}</P>
               </li>
            </ul>
            <ul
               v-if="hasMetadata && hasAdditionalMetadata"
               class="metadata-list"
               :class="{ 'is-separator': hasMandatoryMetadata }"
            >
               <li class="metadata-title">
                  {{ $t('components.marker-card.additional-metadata') }}
               </li>
               <li
                  v-for="item in Object.entries(data?.additionalMetadata || {})"
                  class="metadata-item"
               >
                  <P bold class="capitalize">{{ item[0] }}:</P>
                  <P>{{ item[1] }}</P>
               </li>
            </ul>
            <NoData v-else-if="!isLoading && !hasMetadata" class="no-data" />
         </div>

         <div
            v-if="selectedId === 'measurements'"
            class="measurements-ct"
            :class="{ 'no-data': !hasMeasurements }"
         >
            <div v-if="hasMeasurements" class="measurements-list">
               <div v-for="item in data?.measurements" class="measurement-card">
                  <div class="mc-header">
                     <div class="details">
                        <IconText
                           bold
                           no-padding-x
                           small-gap
                           :text="item.tname"
                        >
                           <AirIcon class="text-grey-2" />
                           <!-- <HydroIcon class="text-grey-2" /> -->
                        </IconText>
                     </div>
                     <P class="value">
                        {{ item.mvalue }}
                        <sup class="unit">
                           {{ item.tunit }}
                        </sup>
                     </P>
                  </div>
                  <div class="mc-footer">
                     <P label>
                        {{
                           $t('common.last-update', {
                              time: formatDate(
                                 new Date(item._timestamp),
                                 'DD.MM.YYYY HH:mm'
                              ),
                           })
                        }}
                     </P>
                     <P
                        class="__clickable text-green"
                        label
                        bold
                        @click="onMoreDetails(item)"
                     >
                        {{ $t('common.more-details') }}
                     </P>
                  </div>
               </div>
            </div>
            <NoData v-else-if="!isLoading" class="no-data" />
         </div>

         <div
            v-if="selectedId === 'alarms'"
            class="alarms-ct"
            :class="{ 'no-data': !hasAlarms }"
         >
            <div v-if="hasAlarms">alarms</div>
            <NoData v-else-if="!isLoading" class="no-data" />
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import MenuButtons from './MenuButtons.vue'
import CloseIcon from './svg/CloseIcon.vue'
import H from './tags/H.vue'
import { useI18n } from 'vue-i18n'
import { MapMarkerDetails } from '../../types/map-layer'
import {
   AnnouncementEvent,
   EventPoint,
   MarkerInfo,
   MarkerMeasurements,
} from '../../types/api'
import { asyncComputed, formatDate } from '@vueuse/core'
import { useFetchWithAuth } from '../../utils/api'
import { useMapLayerStore } from '../../stores/map-layers'
import { useTimeSeriesStore } from '../../stores/time-series'
import { subMonths } from 'date-fns'
import { useRouter } from 'vue-router'

import Loader from './Loader.vue'
import P from './tags/P.vue'
import NoData from './NoData.vue'
import IconText from './IconText.vue'
import AirIcon from './svg/AirIcon.vue'

type Props = {
   marker: MapMarkerDetails
   openOnMeasurements?: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const router = useRouter()
const { t } = useI18n()
const data = ref()
const isLoading = ref(false)
const selectedId = ref<'metadata' | 'measurements' | 'alarms'>('metadata')
const layerStore = useMapLayerStore()
const { getBaseTimeSeriesObj, addTimeSeries, clearTimeSeriesList } =
   useTimeSeriesStore()

const hasMeasurements = computed(() => !!data.value?.measurements.length)
const hasAlarms = computed(() => !!data.value?.alarms.length)
const hasMetadata = computed(
   () =>
      !!Object.entries(
         data.value?.metadata || data.value?.additionalMetadata || {}
      ).length
)

const hasMandatoryMetadata = computed(() => {
   return !!Object.entries(data.value?.metadata || {}).length
})

const hasAdditionalMetadata = computed(() => {
   return !!Object.entries(data.value?.additionalMetadata || {}).length
})

const markerName = computed(() => {
   if (isLoading.value) return '...'

   const name = data.value?.name

   if (!name) return ''

   let result = name.charAt(0).toUpperCase() + name.slice(1)

   return result
})

const isProvinceEvent = computed(() =>
   props.marker.stype.startsWith('PROVINCE_BZ')
)

const links = computed(() => {
   const _links = [
      {
         id: 'metadata',
         title: t('components.marker-card.metadata'),
         action: () => (selectedId.value = 'metadata'),
      },

      // {
      //    id: 'alarms',
      //    title: t('components.marker-card.alarms'),
      //    action: () => (selectedId.value = 'alarms'),
      // },
   ]

   if (!isProvinceEvent.value) {
      _links.push({
         id: 'measurements',
         title: t('components.marker-card.measurements'),
         action: () => (selectedId.value = 'measurements'),
      })
   }

   return _links
})

const onMoreDetails = (measurement: MarkerMeasurements) => {
   const timeSeries = {
      ...getBaseTimeSeriesObj(),
      provider: measurement.sorigin,
      dataset: measurement.stype,
      station: measurement.sname,
      datatype: measurement.tname,
      period: measurement.mperiod.toString(),
   }

   clearTimeSeriesList()
   addTimeSeries(timeSeries)

   const toDate = new Date(measurement._timestamp)
   const fromDate = subMonths(toDate, 1)

   router.push({
      name: 'charts',
      query: {
         from: fromDate.toJSON(),
         to: toDate.toJSON(),
      },
   })
}

const buildAnnouncementMetadata = (
   ev: AnnouncementEvent,
   tFn: (key: string) => string
): { name: string; metadata: Record<string, unknown> } => {
   const formatEventDate = (value?: string | null): string => {
      if (!value) return ''
      return formatDate(new Date(value), 'YYYY-MM-DD HH:mm')
   }

   const getCategory = (event: AnnouncementEvent, index: number): string => {
      if (!event.TagIds || event.TagIds.length <= index) return ''
      const tag = event.TagIds.at(index)
      return tag || ''
   }

   const openEndEvent = !ev.EndTime ? tFn('common.yes') : tFn('common.no')

   const name =
      ev.Shortname || ev.Detail?.it?.Title || ev.Detail?.de?.Title || ''

   const metadata: Record<string, unknown> = {
      startTime: formatEventDate(ev.StartTime),
      endTime: formatEventDate(ev.EndTime),
      openEndEvent,
      provider: ev.Source || ev._Meta?.Source || '',
      category: getCategory(ev, -2),
      subcategory: getCategory(ev, -1),
      descriptionDe: ev.Detail?.de?.BaseText || '',
      descriptionIt: ev.Detail?.it?.BaseText || '',
      shortname: ev.Shortname || '',
   }

   return { name, metadata }
}

const fetchMarkerData = async () => {
   isLoading.value = true

   if (isProvinceEvent.value) {
      const resData = props.marker.eventData

      if (!resData) {
         isLoading.value = false
         return {}
      }

      try {
         const ev =
            typeof resData === 'string'
               ? (JSON.parse(resData) as AnnouncementEvent)
               : (resData as AnnouncementEvent)

         if (ev && ev.StartTime) {
            const built = buildAnnouncementMetadata(ev, t)
            data.value = {
               name: built.name,
               color: layerStore.getAllLayersFlat.find(
                  (l) => l.id === 'Traffic Events'
               )?.color,
               metadata: built.metadata,
               alarms: [],
               measurements: [],
            }
         }
      } catch (e) {
         // ignore malformed data; leave metadata empty
      }
      isLoading.value = false

      return
   }

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat%2Cnode/${props.marker.stype}/?where=scode.eq.%22${props.marker.scode}%22`
   const measurementsUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat%2Cnode/${props.marker.stype}/*/latest?where=scode.eq.%22${props.marker.scode}%22`

   const { data: dataResponse } = await useFetchWithAuth(dataUrl).json()
   const resData = (dataResponse.value?.data?.[0] || {}) as MarkerInfo

   const { data: measurementsResponse } =
      await useFetchWithAuth(measurementsUrl).json()
   const resMeasurements = (measurementsResponse.value?.data ||
      []) as MarkerMeasurements[]

   const mainMetadata: Partial<MarkerInfo> = { ...resData }
   delete mainMetadata.smetadata
   data.value = {
      name: resData.sname,
      color: layerStore.getLayerByStationType(props.marker.stype)?.color,
      metadata: mainMetadata,
      additionalMetadata: resData.smetadata,
      alarms: [],
      measurements: resMeasurements,
   }
   isLoading.value = false
}

watch(links, () => {
   if (isProvinceEvent.value) {
      selectedId.value = 'metadata'
   }
})

fetchMarkerData()

onMounted(() => {
   if (props.openOnMeasurements) {
      selectedId.value = 'measurements'
   }
})
</script>

<style lang="postcss" scoped>
.marker-card-component {
   @apply flex h-[400px] w-[350px] flex-col rounded bg-white;

   & .marker-card-header {
      @apply sticky top-0 flex items-center justify-between gap-2 rounded-t border bg-white p-4;

      & .marker-title-ct {
         @apply flex gap-2;

         &:before {
            @apply w-[2px] flex-shrink-0;
            content: '';
            background-color: v-bind('data?.color');
         }

         & .marker-title {
            @apply line-clamp-2;
         }
      }

      & .marker-close {
         @apply flex-shrink-0 self-start;
      }
   }

   & .marker-card-content {
      @apply relative flex flex-grow flex-col gap-3 overflow-y-auto rounded-b border border-t-0 p-4;

      & .metadata-ct {
         &.no-data {
            @apply flex grow items-center justify-center;
         }

         & .metadata-list {
            @apply flex flex-col gap-1;

            &.is-separator {
               @apply mt-2 border-t pt-2;
            }

            & .metadata-title {
               @apply text-sm font-bold;
            }

            & .metadata-item {
               @apply flex gap-1;
            }
         }
      }

      & .measurements-ct {
         &.no-data {
            @apply flex grow items-center justify-center;
         }

         & .measurements-list {
            @apply flex flex-col gap-3;

            & .measurement-card {
               @apply flex flex-col gap-2 rounded bg-grey p-2;

               & .mc-header {
                  @apply flex flex-col gap-1;

                  & .details {
                     @apply flex justify-between font-semibold uppercase text-grey-2;
                  }

                  & .value {
                     @apply truncate text-4xl font-semibold;
                  }
                  & .unit {
                     @apply text-lg font-semibold;
                  }
               }
               & .mc-footer {
                  @apply flex justify-between;
               }
            }
         }
      }

      & .alarms-ct {
         &.no-data {
            @apply flex grow items-center justify-center;
         }
      }
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .marker-card-component {
   }
}
</style>
