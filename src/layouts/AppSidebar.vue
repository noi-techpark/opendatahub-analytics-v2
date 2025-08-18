<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <aside class="app-sidebar">
      <div class="sidebar-navigation">
         <SidebarNavigation :back="back" />
         <SidebarMapHeader v-if="page === 'map'" />
      </div>

      <div class="sidebar-content">
         <SidebarMapContent
            v-if="page === 'map' && (!!route.hash || sidebarMapContent)"
         />
         <SidebarChartsContent v-if="page === 'charts' && !route.hash" />
         <SidebarEventsContent v-if="page === 'events'" />
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

         <RouterLink to="/about" v-else>
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
import SidebarEventsContent from '../components/nav/SidebarEventsContent.vue'
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

const { sidebarMapContent } = storeToRefs(layoutStore)
const { t } = useI18n()
const showAlarms = ref<boolean>(false)

const showFooter = ref<boolean>(true)
const page = ref<
   'map' | 'charts' | 'charts-add' | 'charts-edit' | 'events' | 'about'
>()

const mapLayerSelection = computed(() => route.name === 'map' && !!route.hash)

const back = computed(() => {
   const isVisible =
      !['/', '/charts', '/events', '/events/weather'].includes(route.path) ||
      !!route.hash ||
      sidebarMapContent.value

   const title =
      route.hash || sidebarMapContent.value
         ? layerStore.getSelectedLayer?.title || t('common.back')
         : t('common.back')

   const routerState = router.options.history.state
   const previousRoute =
      page.value === 'map'
         ? '/'
         : routerState && routerState.back
           ? routerState.back.toString()
           : '/'

   return {
      title,
      visible: isVisible,
      route: previousRoute,
   }
})

watch(route, (newRoute, oldRoute) => {
   const isGoingToMap = newRoute.name === 'map'

   if (isGoingToMap) {
      restoreQueryParamsFromSessionStorage(newRoute.hash)
   }

   switch (route.path) {
      case '/': {
         if (route.hash) {
            layerStore.selectLayer(route.hash.split('#')[1])
         }
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
   @apply relative z-20 flex h-full w-[300px] flex-shrink-0 flex-col overflow-y-auto border-r bg-white px-3;

   & .sidebar-footer {
      @apply mt-auto pb-2 pt-10;
   }
}
</style>
