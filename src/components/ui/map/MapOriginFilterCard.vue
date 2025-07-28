<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div ref="filterCardRef" class="map-origin-filter-card-component">
      <div class="map-origin-filter-card-header">
         <H class="marker-title" tag="h2">{{ t('common.dataprovider') }}</H>
         <CloseIcon class="marker-close __clickable" @click="emit('close')" />
      </div>
      <div class="map-origin-filter-card-content">
         <div class="filters-content">
            <div>
               <P bold>{{ t('common.datatype') }}</P>
               <SelectPopover
                  v-model="selectedFilterOrigins.stype"
                  :text="getLabelOfDataType(selectedFilterOrigins.stype)"
                  :options="stypeOptions"
                  :search-label-placeholder="
                     t('components.map-origin-filter.search-for-datatype')
                  "
                  show-search
               />
            </div>
            <div>
               <P bold>{{ t('common.dataprovider') }}</P>
               <SelectPopover
                  v-if="selectedFilterOrigins.stype"
                  v-model="
                     selectedFilterOrigins.sorigin[selectedFilterOrigins.stype]
                  "
                  :text="
                     selectedFilterOrigins.sorigin[selectedFilterOrigins.stype]
                        ?.length
                        ? `(${selectedFilterOrigins.sorigin[selectedFilterOrigins.stype].length}) ${selectedFilterOrigins.sorigin[selectedFilterOrigins.stype].sort().join(', ')}`
                        : t('common.all')
                  "
                  :options="originOptions"
                  :search-label-placeholder="
                     t('components.map-origin-filter.search-for-dataprovider')
                  "
                  show-search
                  multiple
               />
            </div>
         </div>

         <div class="continue-ct">
            <Button center @click="emit('close')">
               {{ t('common.continue') }}
            </Button>
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import CloseIcon from '../svg/CloseIcon.vue'
import H from '../tags/H.vue'
import { useI18n } from 'vue-i18n'
import SelectPopover from '../popover/SelectPopover.vue'
import P from '../tags/P.vue'
import { storeToRefs } from 'pinia'
import { useMapLayerStore } from '../../../stores/map-layers'
import { onClickOutside } from '@vueuse/core'
import Button from '../Button.vue'

const emit = defineEmits(['close'])
const { t } = useI18n()
const layerStore = useMapLayerStore()
const { uniqueOrigins, selectedFilterOrigins } = storeToRefs(layerStore)
const filterCardRef = ref()

const stypeOptions = computed(() =>
   Object.keys(uniqueOrigins.value).map((e) => ({
      value: e,
      label: getLabelOfDataType(e),
   }))
)

const originOptions = computed(() =>
   uniqueOrigins.value[selectedFilterOrigins.value.stype]
      ? [...uniqueOrigins.value[selectedFilterOrigins.value.stype]].map(
           (v) => ({
              value: v,
              label: v,
           })
        )
      : []
)

const getLabelOfDataType = (origin: string) => {
   const layer = layerStore.getLayerByStationType(origin)
   const id = layer?.id

   if (id === origin) return origin

   return `${id} - ${origin}`
}

onClickOutside(filterCardRef, () => {
   emit('close')
})

onMounted(() => {
   if (
      !selectedFilterOrigins.value.stype ||
      !stypeOptions.value.find(
         (o) => o.value === selectedFilterOrigins.value.stype
      )
   ) {
      const firstStype = stypeOptions.value[0].value
      selectedFilterOrigins.value = {
         stype: firstStype,
         sorigin: { [firstStype]: [], ...selectedFilterOrigins.value.sorigin },
      }
   }
})
</script>

<style lang="postcss" scoped>
.map-origin-filter-card-component {
   @apply flex h-[470px] flex-col rounded bg-white;

   & .map-origin-filter-card-header {
      @apply sticky top-0 flex items-center justify-between gap-2 rounded-t border bg-white p-4;
   }

   & .map-origin-filter-card-content {
      @apply flex flex-grow flex-col justify-between gap-3 overflow-y-auto rounded-b border border-t-0 p-4;

      & .filters-content {
         @apply w-[300px] space-y-3;
      }

      & .continue-ct {
         @apply flex border-t pt-4;
      }
   }
}
</style>
