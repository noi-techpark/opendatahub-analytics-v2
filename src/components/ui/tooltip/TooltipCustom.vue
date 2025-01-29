<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div
      ref="trigger"
      class="tooltip-custom-cmp"
      @click="visible = hover ? visible : !visible"
   >
      <slot></slot>
   </div>
   <Teleport to="#popper-root">
      <div
         ref="tooltip"
         class="tooltip-custom-cmp-content"
         :class="[
            { 'tooltip-custom-cmp-content-hidden': !visible },
            containerClasses,
         ]"
      >
         <!-- Tooltip arrow -->
         <div
            ref="arrow"
            class="tooltip-custom-cmp-arrow"
            :class="arrowClasses"
         ></div>

         <!-- Tooltip -->
         <div class="tooltip-custom-cmp-container">
            <slot name="container"></slot>
         </div>

         <!-- Close button -->
         <button
            v-if="showCloseButton"
            class="tooltip-custom-cmp-close-btn"
            @click="visible = false"
         >
            <CloseIcon class="text-hint-info" />
         </button>
      </div>
   </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CloseIcon from '../svg/CloseIcon.vue'
import { useElementHover } from '@vueuse/core'
import { useFloatingUi } from '../../utils/useFloatingUi'

const props = withDefaults(
   defineProps<{
      containerClasses?: string
      showCloseButton?: boolean
      hover?: boolean
   }>(),
   {
      containerClasses: 'max-w-md',
      showCloseButton: true,
   }
)

const visible = ref(false)
const arrow = ref()

const [trigger, tooltip, placement] = useFloatingUi({
   placement: 'bottom-start',
   offset: 12,
   arrow,
})

const hoverTrigger = useElementHover(trigger, { delayLeave: 100 })
const hoverTooltip = useElementHover(tooltip)

watch([hoverTrigger, hoverTooltip], ([triggerNew, tooltipNew]) => {
   if (props.hover) {
      visible.value = triggerNew || tooltipNew
   }
})

const isBottomPlacement = computed(() => placement.value.startsWith('bottom'))

const arrowClasses = computed(() =>
   isBottomPlacement.value ? 'border-t-2 border-l-2' : 'border-b-2 border-r-2'
)
</script>

<style lang="postcss" scoped>
.tooltip-custom-cmp {
   @apply w-fit;
}

.tooltip-custom-cmp-content {
   @apply absolute z-20 flex rounded border border-gray-300 bg-white p-1.5 shadow-xl;
}

.tooltip-custom-cmp-content-hidden {
   @apply hidden;
}

.tooltip-custom-cmp-arrow {
   @apply absolute size-4 rotate-45 bg-white;
}

.tooltip-custom-cmp-container {
   @apply p-2.5 px-3;
}

.tooltip-custom-cmp-close-btn {
   @apply flex w-4;
}
</style>
