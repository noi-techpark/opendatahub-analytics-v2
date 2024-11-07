<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="map-filter __clickable">
      <div class="map-filter-title">
         <InstantMixIcon />
         <span>{{ title }}</span>
      </div>
      <div class="map-filter-value">
         <span>{{ value }}</span>
      </div>
   </div>
</template>

<script lang="ts" setup>
import InstantMixIcon from '../svg/InstantMixIcon.vue'

type Props = {
   title: string
   value: string
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.map-filter {
   @apply flex select-none items-center text-sm font-semibold;

   & .map-filter-title {
      @apply flex items-center gap-1 rounded-md rounded-r-none border bg-grey px-3 py-1;
   }

   & .map-filter-value {
      @apply rounded-md rounded-l-none border border-l-0 bg-grey px-2 py-1;
   }
}
</style>
