<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <ul class="sidebar-map-header" :class="{ back: !!route.hash }">
    <SidebarNavigation
      :back="{
        visible: !!route.hash,
        title: layerStore.getSelectedLayer?.title || '',
        route: '/',
      }"
    />

    <li
      v-if="!route.hash"
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
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useLayerStore } from '../../stores/map-layers.js'
import IconText from '../ui/IconText.vue'
import AirlineStopIcon from '../ui/svg/AirlineStopIcon.vue'
import ArrowRightIcon from '../ui/svg/ArrowRightIcon.vue'
import ExploreIcon from '../ui/svg/ExploreIcon.vue'
import LocationSearchingIcon from '../ui/svg/LocationSearchingIcon.vue'
import SidebarNavigation from './SidebarNavigation.vue'
import { computed, watch } from 'vue'

const layerStore = useLayerStore()
const route = useRoute()

watch(route, () => {
  if (route.hash) {
    layerStore.selectLayer(route.hash.split('#')[1])
  }
})

const backTitle = computed(() => {
  return !!route.hash
})
</script>

<style lang="postcss" scoped>
.sidebar-map-header {
  @apply flex flex-col;

  &.back {
    @apply -mb-2;
  }

  & .layer-title {
    @apply transition-colors rounded-small flex justify-between items-center pr-1;

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
}
</style>
