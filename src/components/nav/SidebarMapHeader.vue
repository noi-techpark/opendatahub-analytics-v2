<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div
      v-if="!route.hash && !sidebarMapContent"
      v-for="(item, i) in layerStore.getAllLayers"
      class="__clickable"
   >
      <RouterLink class="layer-title" :to="`#${item.id}`">
         <IconText :text="item.title">
            <LocationSearchingIcon v-if="i === 0" />
            <AirlineStopIcon v-if="i === 1" />
            <ExploreIcon v-if="i === 2" />
         </IconText>
         <ArrowRightIcon class="arrow" />
      </RouterLink>
   </div>

   <Divider v-if="!route.hash && !sidebarMapContent" :noTop="!!route.hash" />
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useMapLayerStore } from '../../stores/map-layers.js'
import IconText from '../ui/IconText.vue'
import AirlineStopIcon from '../ui/svg/AirlineStopIcon.vue'
import ArrowRightIcon from '../ui/svg/ArrowRightIcon.vue'
import ExploreIcon from '../ui/svg/ExploreIcon.vue'
import LocationSearchingIcon from '../ui/svg/LocationSearchingIcon.vue'
import Divider from '../ui/Divider.vue'
import { useLayoutStore } from '../../stores/layout'
import { storeToRefs } from 'pinia'

const route = useRoute()
const layerStore = useMapLayerStore()
const layoutStore = useLayoutStore()
const { sidebarMapContent } = storeToRefs(layoutStore)
</script>

<style lang="postcss" scoped>
.layer-title {
   @apply flex items-center justify-between rounded pr-1 transition-colors;

   & .arrow {
      @apply opacity-0 transition-opacity;
   }

   &:hover {
      @apply bg-grey;

      & .arrow {
         @apply opacity-100;
      }
   }
}
</style>
