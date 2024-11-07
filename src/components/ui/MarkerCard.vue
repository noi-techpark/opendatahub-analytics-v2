<template>
   <div class="marker-card-component">
      <div class="marker-card-header">
         <div class="marker-title-ct">
            <H class="marker-title" tag="h2">{{ data?.name }}</H>
         </div>
         <CloseIcon class="marker-close __clickable" @click="$emit('close')" />
      </div>
      <div class="marker-card-content">
         <MenuButtons :links :selectedIdx="selectedIdx" />
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
import { MarkerData, MarkerInfo } from '../../types/api'
import { asyncComputed, useFetch } from '@vueuse/core'
import { useMapLayerStore } from '../../stores/map-layers'

type Props = {
   marker: MapMarkerDetails
}

const props = withDefaults(defineProps<Props>(), {})

const { t } = useI18n()
const selectedIdx = ref<number>(0)
const layerStore = useMapLayerStore()

const links = computed(() => [
   {
      title: t('components.marker-card.metadata.title'),
      action: () => (selectedIdx.value = 0),
   },
   {
      title: t('components.marker-card.measurements'),
      action: () => (selectedIdx.value = 1),
   },
   {
      title: t('components.marker-card.alarms'),
      action: () => (selectedIdx.value = 2),
   },
])

const data = asyncComputed(async () => {
   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${props.marker.stype}/*/latest?where=scode.eq.%22${props.marker.scode}%22`
   const infoUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${props.marker.stype}/?where=scode.eq.%22${props.marker.scode}%22`

   const resInfo: MarkerInfo = JSON.parse(
      (await useFetch(infoUrl)).text().data.value || '{}'
   ).data
   const resData: MarkerData = JSON.parse(
      (await useFetch(dataUrl)).text().data.value || '{}'
   ).data

   console.log(resData)
   console.log(resInfo)

   return {
      name: resInfo[props.marker.stype].stations[props.marker.scode].sname,
      color: layerStore.getLayerByStationType(props.marker.stype)?.color,
   }
})
</script>

<style lang="postcss" scoped>
.marker-card-component {
   @apply flex aspect-[1.18] max-w-[350px] flex-col overflow-hidden rounded bg-white;

   & .marker-card-header {
      @apply flex items-center justify-between gap-2 rounded-t border p-4;

      & .marker-title-ct {
         @apply flex gap-2;

         &:before {
            @apply w-[2px] flex-shrink-0;
            content: '';
            background-color: v-bind(data?.color);
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
      @apply flex-grow rounded-b border border-t-0 p-4;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .marker-card-component {
   }
}
</style>
