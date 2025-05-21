<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="marker-card-component">
      <div class="marker-card-header">
         <div class="marker-title-ct">
            <H class="marker-title" tag="h2">{{ data?.name }}</H>
         </div>
         <CloseIcon class="marker-close __clickable" @click="$emit('close')" />
      </div>
      <div class="marker-card-content">
         <MenuButtons class="sticky" :links :selected-id="selectedId" />
         <div
            v-if="selectedId === 'metadata'"
            class="metadata-ct"
            :class="{ 'no-data': !hasMetadata }"
         >
            <ul v-if="hasMetadata" class="metadata-list">
               <li
                  v-for="item in Object.entries(data?.metadata || {})"
                  class="metadata-item"
               >
                  <P bold class="capitalize">{{ item[0] }}:</P>
                  <P>{{ item[1] }}</P>
               </li>
            </ul>
            <NoData v-else class="no-data" />
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
            <NoData v-else class="no-data" />
         </div>

         <div
            v-if="selectedId === 'alarms'"
            class="alarms-ct"
            :class="{ 'no-data': !hasAlarms }"
         >
            <div v-if="hasAlarms">alarms</div>
            <NoData v-else class="no-data" />
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import MenuButtons from './MenuButtons.vue'
import CloseIcon from './svg/CloseIcon.vue'
import H from './tags/H.vue'
import { useI18n } from 'vue-i18n'
import { MapMarkerDetails } from '../../types/map-layer'
import { TimeSeries } from '../../types/time-series'
import { MarkerInfo, MarkerMeasurements } from '../../types/api'
import { asyncComputed, formatDate, useFetch } from '@vueuse/core'
import { useMapLayerStore } from '../../stores/map-layers'
import { useTimeSeriesStore } from '../../stores/time-series'
import { subMonths } from 'date-fns'
import { useRouter } from 'vue-router'

import P from './tags/P.vue'
import { typeOf } from 'maplibre-gl'
import NoData from './NoData.vue'
import IconText from './IconText.vue'
import AirIcon from './svg/AirIcon.vue'
import HydroIcon from './svg/HydroIcon.vue'

type Props = {
   marker: MapMarkerDetails
}

const props = withDefaults(defineProps<Props>(), {})

const router = useRouter()
const { t } = useI18n()
const selectedId = ref<'metadata' | 'measurements' | 'alarms'>('metadata')
const layerStore = useMapLayerStore()
const { getBaseTimeSeriesObj, addTimeSeries, clearTimeSeriesList } =
   useTimeSeriesStore()

const hasMeasurements = computed(() => !!data.value?.measurements.length)
const hasAlarms = computed(() => !!data.value?.alarms.length)
const hasMetadata = computed(
   () => !!Object.entries(data.value?.metadata || {}).length
)

const links = computed(() => [
   {
      id: 'metadata',
      title: t('components.marker-card.metadata'),
      action: () => (selectedId.value = 'metadata'),
   },
   {
      id: 'measurements',
      title: t('components.marker-card.measurements'),
      action: () => (selectedId.value = 'measurements'),
   },
   {
      id: 'alarms',
      title: t('components.marker-card.alarms'),
      action: () => (selectedId.value = 'alarms'),
   },
])

const onMoreDetails = (measurement: MarkerMeasurements) => {
   const timeSeries = {
      ...getBaseTimeSeriesObj(),
      provider: measurement.sorigin,
      dataset: measurement.stype,
      station: measurement.sname,
      datatype: measurement.tname,
      period: measurement.mperiod,
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

const data = asyncComputed(async () => {
   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat%2Cnode/${props.marker.stype}/?where=scode.eq.%22${props.marker.scode}%22`
   const measurementsUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat%2Cnode/${props.marker.stype}/*/latest?where=scode.eq.%22${props.marker.scode}%22`

   const resData = JSON.parse(
      (await useFetch(dataUrl)).text().data.value || '{}'
   ).data[0] as MarkerInfo

   const resMeasurements = JSON.parse(
      (await useFetch(measurementsUrl)).text().data.value || '{}'
   ).data as MarkerMeasurements[]

   return {
      name: resData.sname,
      color: layerStore.getLayerByStationType(props.marker.stype)?.color,
      metadata: resData.smetadata,
      alarms: [],
      measurements: resMeasurements,
   }
})
</script>

<style lang="postcss" scoped>
.marker-card-component {
   @apply flex h-[400px] max-w-[350px] flex-col rounded bg-white;

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
      @apply flex flex-grow flex-col gap-3 overflow-y-auto rounded-b border border-t-0 p-4;

      & .metadata-ct {
         &.no-data {
            @apply flex grow items-center justify-center;
         }

         & .metadata-list {
            @apply flex flex-col gap-1;

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
                     @apply text-4xl font-semibold;
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
