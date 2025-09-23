<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="app-layout">
      <div v-if="showAppHeader" ref="appHeader">
         <AppHeader :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" />
      </div>
      <div
         class="content-ct"
         :class="{ 'sidebar-hidden': !isSidebarVisible && showAppSidebar }"
      >
         <AppSidebar v-if="showAppSidebar" />
         <div class="main-content">
            <slot />
         </div>
      </div>
      <div
         v-if="showAppSidebar && isSidebarVisible"
         class="sidebar-overlay"
         @click="toggleSidebar"
      ></div>
      <div
         v-if="showAppSidebar"
         class="sidebar-toggle-float"
         @click="toggleSidebar"
      >
         <AnalysisIcon v-if="!isSidebarVisible" />
         <CloseIcon v-else />
      </div>
   </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '../stores/layout'
import { storeToRefs } from 'pinia'
import AnalysisIcon from '../components/ui/svg/AnalysisIcon.vue'
import CloseIcon from '../components/ui/svg/CloseIcon.vue'

const route = useRoute()
const isMenuOpen = ref(true)
const appHeader = ref<HTMLElement>()
const layoutStore = useLayoutStore()
const { isSidebarVisible } = storeToRefs(layoutStore)
const { toggleSidebar } = layoutStore

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

      & .main-content {
         @apply flex-grow overflow-hidden;
      }
   }

   & .sidebar-toggle-float {
      @apply hidden;
   }
}

@media (max-width: theme('screens.md')) {
   .app-layout {
      & .content-ct {
         @apply relative;

         &.sidebar-hidden {
            & .main-content {
               @apply ml-0;
            }
         }
      }

      & .sidebar-overlay {
         @apply fixed inset-0 z-10 bg-black bg-opacity-50;
      }

      & .sidebar-toggle-float {
         @apply fixed bottom-2 right-2 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full border bg-white shadow-lg;

         & svg {
            @apply size-5;
         }
      }
   }
}
</style>
