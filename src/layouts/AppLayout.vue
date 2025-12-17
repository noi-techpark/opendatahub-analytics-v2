<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="app-layout">
      <div v-if="showAppHeader" ref="appHeader" class="z-20">
         <AppHeader :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" />
      </div>
      <div v-if="showAppSidebar" class="mobile-navigation">
         <SidebarNavigation :back="back" hide-back />
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
         v-if="showAppSidebar && route.path !== '/events'"
         class="sidebar-toggle-float"
         @click="toggleSidebar"
      >
         <ArrowDownIcon :class="{ 'rotate-180': !isSidebarVisible }" />
         <div class="message">{{ sidebarMessage }}</div>
      </div>
   </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import SidebarNavigation from '../components/nav/SidebarNavigation.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '../stores/layout'
import { storeToRefs } from 'pinia'
import ArrowDownIcon from '../components/ui/svg/ArrowDownIcon.vue'
import { useMapLayerStore } from '../stores/map-layers'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const isMenuOpen = ref(false)
const appHeader = ref<HTMLElement>()
const layoutStore = useLayoutStore()
const { isSidebarVisible, sidebarMapContent } = storeToRefs(layoutStore)
const { toggleSidebar } = layoutStore
const layerStore = useMapLayerStore()

const headerHeight = computed(() => `${appHeader.value?.offsetHeight}px`)
const isEmbedMode = computed(() => route.query.viewMode === 'embed')
const showAppHeader = computed(() => !isEmbedMode.value)
const showAppSidebar = computed(() => !isEmbedMode.value)

const sidebarMessage = computed(() => {
   switch (route.path) {
      case '/charts':
      case '/charts/add':
      case '/charts/edit':
         return t('components.sidebar-toggle.chart-settings')
      case '/alarms':
         return t('components.sidebar-toggle.select-dataset')
      default:
         return t('components.sidebar-toggle.select-dataset')
   }
})

function toggleMenu() {
   isMenuOpen.value = !isMenuOpen.value
}

const page = computed(() => {
   if (route.path === '/') return 'map'
   if (route.path === '/charts') return 'charts'
   if (route.path === '/alarms') return 'alarms'
   if (route.path === '/events') return 'events'
   return 'map'
})

const back = computed(() => {
   const isVisible =
      !['/', '/charts', '/alarms', '/events'].includes(route.path) ||
      !!route.hash ||
      (sidebarMapContent.value &&
         (page.value === 'map' || page.value === 'alarms'))

   const title =
      route.hash || sidebarMapContent.value
         ? layerStore.getSelectedLayer?.title || t('common.back')
         : t('common.back')

   const routerState = router.options.history.state
   const previousRoute =
      page.value === 'map'
         ? '/'
         : page.value === 'alarms'
           ? '/alarms'
           : page.value === 'events'
             ? '/events'
             : routerState && routerState.back
               ? routerState.back.toString()
               : '/'

   return {
      title,
      visible: isVisible,
      route: previousRoute,
   }
})
</script>

<style lang="postcss" scoped>
.app-layout {
   @apply flex h-full flex-col overflow-y-auto;

   & .mobile-navigation {
      @apply hidden;
   }

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
      & .mobile-navigation {
         @apply fixed left-0 right-0 z-10 block border-b bg-white shadow-sm;
         top: v-bind('headerHeight');
      }

      & .content-ct {
         @apply relative;
         padding-top: 49px;

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
         @apply fixed bottom-0 left-0 right-0 z-50 flex cursor-pointer items-center gap-2 border bg-white px-5 py-4 shadow-lg;

         & svg {
            @apply size-5 transition-transform duration-300;
         }

         & .message {
            @apply text-sm font-medium;
         }
      }
   }
}
</style>
