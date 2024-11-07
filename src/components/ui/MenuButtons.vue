<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="menu-buttons-ct" :class="{ grow }">
      <component
         :is="item.route ? 'RouterLink' : 'div'"
         v-for="(item, i) in links"
         class="menu-buttons __clickable"
         :class="{
            selected: selectedIdx === i,
            first: i === 0,
            last: i === links.length - 1,
         }"
         :to="item.route"
         @click="item.action"
      >
         {{ item.title }}
      </component>
   </div>
</template>

<script lang="ts" setup>
type Props = {
   links: {
      title: string
      route?: string
      action?: () => void
   }[]
   grow?: boolean
   selectedIdx: number
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.menu-buttons-ct {
   @apply inline-flex select-none;

   & .menu-buttons {
      @apply min-w-20 flex-grow border border-l-0 bg-grey px-5 py-1 text-center text-sm font-semibold transition-all;

      &.first {
         @apply rounded-l border-l;
      }
      &.last {
         @apply rounded-r;
      }
      &.selected {
         @apply border-green bg-green text-white;
      }
   }
}
</style>
