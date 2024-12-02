<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-map-content">
      <ul v-if="layerStore.getSelectedLayer" class="layer-list">
         <Checkbox
            class="layer-item"
            :checked="
               layerStore.areAllLayersInGroupSelected(
                  layerStore.getSelectedLayer.id
               )
            "
            @change="handleToggleAll"
            :label="$t('common.all')"
         />
         <li
            v-for="(layer, j) in layerStore.getSelectedLayer.layers"
            :key="layer.id"
            class="layer-item"
         >
            <Checkbox
               class="flex-grow"
               :checked="
                  layerStore.isLayerSelected(layerStore.getSelectedLayer.id, j)
               "
               @change="() => handleLayerToggle(j)"
               :label="layer.id"
            />

            <div
               v-if="
                  layerStore.isLayerSelected(layerStore.getSelectedLayer.id, j)
               "
               class="layer-item-color"
               :style="{
                  'background-color': layer.color,
               }"
            />
         </li>
      </ul>
      <Divider />
   </div>
</template>

<script lang="ts" setup>
import { useMapLayerStore } from '../../stores/map-layers'
import Checkbox from '../ui/Checkbox.vue'
import Divider from '../ui/Divider.vue'

const layerStore = useMapLayerStore()

const handleToggleAll = () => {
   if (layerStore.getSelectedLayer) {
      layerStore.toggleAllInGroup(layerStore.getSelectedLayer.id)
   }
}

const handleLayerToggle = (index: number) => {
   if (layerStore.getSelectedLayer) {
      layerStore.toggleLayer(layerStore.getSelectedLayer.id, index)
   }
}
</script>

<style lang="postcss" scoped>
.sidebar-map-content {
   & .layer-list {
      & .layer-item {
         @apply flex items-center pl-3 pr-[6px];

         & .layer-item-color {
            @apply size-3 rounded-full;
         }
      }
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-map-content {
   }
}
</style>
