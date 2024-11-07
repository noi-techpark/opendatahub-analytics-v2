<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div
      class="map-marker-component __clickable"
      @click="map?.fire('marker-click', { eventData: { scode, stype } })"
   >
      <MarkerIcon
         v-if="!selected"
         class="marker-icon"
         :class="[alarm ? 'text-grey-2' : 'text-yellow']"
      />
      <MarkerSelectedIcon
         v-else
         class="marker-icon"
         :class="[alarm ? 'text-grey-2' : 'text-yellow']"
      />

      <div
         v-if="color && !alarm"
         class="badge"
         :style="{ backgroundColor: color }"
      />
   </div>
</template>

<script lang="ts" setup>
import { Map } from 'maplibre-gl'
import MarkerIcon from '../../../assets/map/MarkerIcon.vue'
import { DataMarker } from '../../../types/api'
import MarkerSelectedIcon from '../../../assets/map/MarkerSelectedIcon.vue'

type Props = DataMarker & {
   map?: Map
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.map-marker-component {
   @apply relative;

   & .marker-icon {
      @apply z-0 w-12;
      filter: drop-shadow(0px -3px 5px #00000010);
   }

   & .badge {
      @apply absolute right-0 top-0 z-10 size-4 rounded-full border-2 border-white;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .map-marker-component {
   }
}
</style>
