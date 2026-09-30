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
                     <P v-if="!item.displayParts" class="value">
                        {{ item.mvalue }}
                        <sup class="unit">
                           {{ item.tunit }}
                        </sup>
                     </P>
                     <div v-else class="mapped-value">
                        <template
                           v-for="(part, index) in item.displayParts"
                           :key="`${part.text}-${index}`"
                        >
                           <span v-if="index" class="mapped-separator">|</span>
                           <img
                              v-if="part.imageSrc"
                              class="mapped-image"
                              :src="part.imageSrc"
                              :alt="part.title || part.text"
                              :title="part.title || part.text"
                           />
                           <span>{{ part.text }}</span>
                        </template>
                        <sup v-if="item.tunit" class="unit">
                           {{ item.tunit }}
                        </sup>
                     </div>
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
   MarkerInfo,
   MarkerMeasurements,
} from '../../types/api'
import { formatDate } from '@vueuse/core'
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
const { locale, t } = useI18n()
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

type ImageMappingMetadata = {
   id?: string | number
   description?: Record<string, string>
   [key: string]: unknown
}

const getMappingDescription = (entry: ImageMappingMetadata): string => {
   const descriptions = entry.description || {}
   const language = locale.value.split('-')[0]
   return (
      descriptions[language] ||
      descriptions.it ||
      descriptions.de ||
      descriptions.en ||
      String(entry.id ?? '')
   )
}

const applyImageMappings = async (
   measurements: MarkerMeasurements[]
): Promise<MarkerMeasurements[]> => {
   const imageMappings =
      layerStore.getLayerByStationType(props.marker.stype)?.imageMapping || []

   if (imageMappings.length === 0) return measurements

   const mappedMeasurements = [...measurements]

   await Promise.all(
      imageMappings.map(async (mapping) => {
         const matchingMeasurements = mappedMeasurements.filter(
            (measurement) => measurement.tname === mapping.dataType
         )
         if (matchingMeasurements.length === 0) return

         let metadata: ImageMappingMetadata[] | undefined
         try {
            const metadataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${encodeURIComponent(props.marker.stype)}/${encodeURIComponent(mapping.dataType)}?limit=1&offset=0&shownull=false&distinct=true&select=tmetadata`
            const { data: metadataResponse } =
               await useFetchWithAuth(metadataUrl).json()
            metadata = metadataResponse.value?.data?.[0]?.tmetadata?.[
               mapping.dataTypeMetadata
            ] as ImageMappingMetadata[] | undefined
         } catch (error) {
            console.error('Failed to load measurement image mapping:', error)
            return
         }

         if (!Array.isArray(metadata)) return

         for (const measurement of matchingMeasurements) {
            const values = String(measurement.mvalue).split(
               mapping.valueSeparator
            )
            measurement.displayParts = values.map((value) => {
               const normalizedValue = value.trim()
               const entry = metadata.find(
                  (candidate) => String(candidate.id) === normalizedValue
               )

               if (!entry) return { text: normalizedValue }

               const description = getMappingDescription(entry)
               const encodedImage = entry[mapping.metaDataImgData]
               return {
                  text: description,
                  title: description,
                  imageSrc:
                     typeof encodedImage === 'string' && encodedImage
                        ? encodedImage.startsWith('data:')
                           ? encodedImage
                           : `data:image/*;base64,${encodedImage}`
                        : undefined,
               }
            })
         }
      })
   )

   return mappedMeasurements
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

   const escapedStationCode = props.marker.scode.replace(/(['"()\\])/g, '\\$1')
   const where = encodeURIComponent(`scode.eq."${escapedStationCode}"`)
   const stationType = encodeURIComponent(props.marker.stype)
   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,node/${stationType}?where=${where}`
   const measurementsUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,node/${stationType}/*/latest?where=${where}`

   try {
      const [{ data: dataResponse }, { data: measurementsResponse }] =
         await Promise.all([
            useFetchWithAuth(dataUrl).json(),
            useFetchWithAuth(measurementsUrl).json(),
         ])
      const resData = (dataResponse.value?.data?.[0] || {}) as MarkerInfo
      const resMeasurements = await applyImageMappings(
         (measurementsResponse.value?.data || []) as MarkerMeasurements[]
      )

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
   } catch (error) {
      console.error('Failed to load marker details:', error)
   } finally {
      isLoading.value = false
   }
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
   @apply absolute top-14 z-10 flex h-[400px] w-[350px] flex-col rounded bg-white;

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
                  & .mapped-value {
                     @apply flex flex-wrap items-center gap-1 text-sm font-semibold;

                     & .mapped-image {
                        @apply size-6 object-contain;
                     }

                     & .mapped-separator {
                        @apply px-1 text-grey-2;
                     }
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
      @apply left-4;
   }
}
</style>
