<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="map-settings-dropdown">
      <!-- Settings Button -->
      <div class="settings-button-container">
         <button
            class="settings-button settings-button-label"
            @click="toggleDropdown"
         >
            <span class="settings-label">{{
               t('layouts.app-sidebar.map-settings')
            }}</span>
         </button>
         <button
            class="settings-button settings-button-icon"
            @click="toggleDropdown"
         >
            <div class="arrow-icon" :class="{ 'arrow-rotated': isOpen }">
               <ArrowDownIcon />
            </div>
         </button>
      </div>

      <!-- Dropdown Content -->
      <transition name="dropdown">
         <div v-if="isOpen" class="dropdown-content">
            <div class="dropdown-options">
               <!-- Highlight alarms option -->
               <Checkbox
                  :checked="localShowAlarms"
                  :label="t('layouts.app-sidebar.alarms')"
                  @change="localShowAlarms = !localShowAlarms"
               />

               <!-- Hide inactive sensors option -->
               <Checkbox
                  :checked="localHideInactiveSensors"
                  :label="t('layouts.app-sidebar.hide-inactive-sensors')"
                  @change="localHideInactiveSensors = !localHideInactiveSensors"
               />
            </div>

            <div class="dropdown-actions">
               <button class="btn-close" @click="handleClose">
                  {{ t('common.close') }}
               </button>
               <button class="btn-save" @click="handleSave">
                  {{ t('common.save') }}
               </button>
            </div>
         </div>
      </transition>
   </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapLayerStore } from '../../../stores/map-layers'
import { storeToRefs } from 'pinia'
import ArrowDownIcon from '../svg/ArrowDownIcon.vue'
import Checkbox from '../Checkbox.vue'

const { t } = useI18n()
const layerStore = useMapLayerStore()
const { showAlarms, hideInactiveSensors } = storeToRefs(layerStore)

const isOpen = ref(false)
const localShowAlarms = ref(showAlarms.value)
const localHideInactiveSensors = ref(hideInactiveSensors.value)

// Sync local state with store when dropdown is opened
watch(isOpen, (newValue) => {
   if (newValue) {
      localShowAlarms.value = showAlarms.value
      localHideInactiveSensors.value = hideInactiveSensors.value
   }
})

const toggleDropdown = () => {
   isOpen.value = !isOpen.value
}

const handleClose = () => {
   // Restore previous state
   localShowAlarms.value = showAlarms.value
   localHideInactiveSensors.value = hideInactiveSensors.value
   isOpen.value = false
}

const handleSave = () => {
   // Save to store
   showAlarms.value = localShowAlarms.value
   hideInactiveSensors.value = localHideInactiveSensors.value
   isOpen.value = false
}
</script>

<style lang="postcss" scoped>
.map-settings-dropdown {
   @apply relative;
}

.settings-button-container {
   @apply inline-flex leading-[0];
}

.settings-button {
   @apply flex h-[28px] cursor-pointer items-center justify-center border border-stroke bg-grey px-3 py-3 transition-colors;

   &:hover {
      @apply bg-gray-100;
   }
}

.settings-button-label {
   @apply rounded-bl-md rounded-tl-md;
}

.settings-button-icon {
   @apply size-[28px] rounded-br-md rounded-tr-md border-l-0 px-3;
}

.settings-label {
   @apply font-sans text-sm font-semibold leading-[21px] text-black-2;
}

.arrow-icon {
   @apply flex size-5 items-center justify-center transition-transform duration-200;
}

.arrow-rotated {
   @apply rotate-180;
}

.dropdown-content {
   @apply absolute right-0 top-[calc(100%+2px)] z-50 flex w-[296px] flex-col gap-2 rounded-md border border-stroke bg-white p-2 shadow-lg;
}

.dropdown-options {
   @apply flex w-[280px] flex-col items-start justify-center px-2;
}

.dropdown-actions {
   @apply flex items-start gap-2;
}

.btn-close,
.btn-save {
   @apply flex h-8 grow basis-0 items-center justify-center rounded-md px-2 py-[3px] text-center font-sans text-sm font-semibold leading-[21px] transition-colors;
}

.btn-close {
   @apply border border-green bg-white text-green;

   &:hover {
      @apply bg-green/5;
   }
}

.btn-save {
   @apply bg-green text-white;

   &:hover {
      @apply bg-green/90;
   }
}

.dropdown-enter-active,
.dropdown-leave-active {
   @apply transition-all duration-200;
}

.dropdown-enter-from,
.dropdown-leave-to {
   @apply -translate-y-1 opacity-0;
}
</style>
