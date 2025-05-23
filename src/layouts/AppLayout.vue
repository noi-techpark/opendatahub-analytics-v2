<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="app-layout">
      <div v-if="showAppHeader" ref="appHeader">
         <AppHeader :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" />
      </div>

      <div class="content-ct">
         <AppSidebar v-if="showAppSidebar" />
         <slot />
      </div>
   </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)
const appHeader = ref<HTMLElement>()
const headerHeight = computed(() => `${appHeader.value?.offsetHeight}px`)
const isEmbedMode = computed(() => route.query.viewMode === 'embed')
const showAppHeader = computed(() => !isEmbedMode.value)
const showAppSidebar = computed(() => !isEmbedMode.value)

function toggleMenu() {
   isMenuOpen.value = !isMenuOpen.value
}
</script>

<style lang="postcss" scoped>
.app-layout {
   @apply flex h-full flex-col overflow-y-auto;

   & .content-ct {
      @apply flex h-screen;

      max-height: calc(100vh - v-bind('headerHeight'));
   }
}
</style>
