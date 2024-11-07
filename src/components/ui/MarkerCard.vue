<template>
   <div class="marker-card-component">
      <div class="marker-card-header">
         <div class="marker-title-ct">
            <div class="marker-title-indicator" />
            <H class="marker-title" tag="h2">{{ marker.name }}</H>
         </div>
         <CloseIcon class="marker-close __clickable" @click="$emit('close')" />
      </div>
      <div class="marker-card-content">
         <MenuButtons :links :selectedIdx="selectedIdx" />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import MenuButtons from './MenuButtons.vue'
import CloseIcon from './svg/CloseIcon.vue'
import H from './tags/H.vue'
import { useI18n } from 'vue-i18n'

export type MarkerDetails = {
   name: string
}

type Props = {
   marker: MarkerDetails
}
const props = withDefaults(defineProps<Props>(), {})

const { t } = useI18n()
const selectedIdx = ref<number>(0)

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
</script>

<style lang="postcss" scoped>
.marker-card-component {
   @apply flex aspect-[1.18] max-w-[350px] flex-col overflow-hidden rounded bg-white;

   & .marker-card-header {
      @apply flex items-center justify-between gap-1 rounded-t border p-4;

      & .marker-title-ct {
         @apply flex gap-3;

         &:before {
            @apply w-[2px] flex-shrink-0 bg-yellow;
            content: '';
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
