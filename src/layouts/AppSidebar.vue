<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <aside
      class="app-sidebar"
      :class="{ 'sidebar-mobile-hidden': !isSidebarVisible }"
   >
      <div class="sidebar-navigation">
         <SidebarNavigation :back="back" />
         <SidebarMapHeader v-if="page === 'map' || page === 'alarms'" />
      </div>

      <div class="sidebar-content">
         <SidebarMapContent
            v-if="
               (page === 'map' || page === 'alarms') &&
               (!!route.hash || sidebarMapContent)
            "
         />
         <SidebarChartsContent v-if="page === 'charts' && !route.hash" />
      </div>

      <div class="sidebar-footer" v-if="showFooter">
         <Divider />

         <Switch
            v-if="mapLayerSelection"
            v-model="showAlarms"
            expand
            expand-slot
         >
            <IconText
               :text="$t('layouts.app-sidebar.alarms')"
               noPaddingX
               reverse
               class="grow"
               :hover="false"
            >
               <InfoIcon class="size-5" />
            </IconText>
         </Switch>

         <RouterLink to="/about">
            <IconText :text="$t('common.about')">
               <InfoIcon />
            </IconText>
         </RouterLink>
      </div>
   </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import SidebarMapContent from '../components/nav/SidebarMapContent.vue'
import SidebarChartsContent from '../components/nav/SidebarChartsContent.vue'
import IconText from '../components/ui/IconText.vue'
import InfoIcon from '../components/ui/svg/InfoIcon.vue'
import SidebarMapHeader from '../components/nav/SidebarMapHeader.vue'
import Divider from '../components/ui/Divider.vue'
import { useMapLayerStore } from '../stores/map-layers'
import SidebarNavigation from '../components/nav/SidebarNavigation.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import Switch from '../components/ui/Switch.vue'
import { restoreQueryParamsFromSessionStorage } from '../utils/url-query'
import { useLayoutStore } from '../stores/layout'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const layerStore = useMapLayerStore()
const layoutStore = useLayoutStore()

const { sidebarMapContent, isSidebarVisible } = storeToRefs(layoutStore)
const { toggleSidebar } = layoutStore
const { t } = useI18n()
const showAlarms = ref<boolean>(false)

const showFooter = ref<boolean>(true)
const page = ref<
   | 'map'
   | 'charts'
   | 'charts-add'
   | 'charts-edit'
   | 'alarms'
   | 'events'
   | 'about'
>()

const mapLayerSelection = computed(() => route.name === 'map')

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

const selectLayerFromHash = () => {
   if (route.hash) {
      layerStore.selectLayer(route.hash.split('#')[1])
   }
}

watch(route, (newRoute, oldRoute) => {
   const isGoingToMap = newRoute.name === 'map'
   const isGoingToAlarms = newRoute.name === 'alarms'

   if (isGoingToMap || isGoingToAlarms) {
      restoreQueryParamsFromSessionStorage(newRoute.hash)
   }

   switch (route.path) {
      case '/': {
         selectLayerFromHash()
         showFooter.value = true
         page.value = 'map'
         break
      }
      case '/charts': {
         page.value = 'charts'
         showFooter.value = true
         break
      }
      case '/charts/add':
      case '/charts/edit':
         page.value =
            route.path === '/charts/add' ? 'charts-add' : 'charts-edit'
         showFooter.value = false
         break
      case '/alarms': {
         selectLayerFromHash()
         showFooter.value = true
         page.value = 'alarms'
         break
      }

      case '/events': {
         showFooter.value = true
         page.value = 'events'
         break
      }

      case '/about': {
         showFooter.value = false
         page.value = 'about'
         break
      }
   }
})
</script>

<style lang="postcss" scoped>
.app-sidebar {
   @apply relative z-20 flex h-full w-[400px] flex-shrink-0 flex-col overflow-y-auto border-r bg-white px-3 transition-all duration-300;

   & .sidebar-footer {
      @apply mt-auto pb-2 pt-10;
   }
}

@media (max-width: theme('screens.md')) {
   .app-sidebar {
      @apply fixed bottom-0 left-0 top-0 w-5/6 shadow-lg;

      &.sidebar-mobile-hidden {
         @apply -translate-x-full;
      }
   }
}
</style>
