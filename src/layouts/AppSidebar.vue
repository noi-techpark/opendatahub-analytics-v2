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
         <SidebarMapContent v-if="page === 'map' && !!route.hash" />
         <SidebarChartsContent v-if="page === 'charts' && !route.hash" />
         <SidebarEventsContent v-if="page === 'events'" />
      </div>

      <div class="sidebar-footer" v-if="showFooter">
         <Divider />
         <div v-if="mapLayerSelection">TODO: alarms</div>

         <RouterLink to="/about" v-else>
            <IconText :text="$t('common.about')">
               <IconInfo />
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
import IconInfo from '../components/tmp/components/svg/IconInfo.vue'
import SidebarMapHeader from '../components/nav/SidebarMapHeader.vue'
import Divider from '../components/ui/Divider.vue'
import { useLayerStore } from '../stores/map-layers'
import SidebarNavigation from '../components/nav/SidebarNavigation.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const layerStore = useLayerStore()
const { t } = useI18n()

const showFooter = ref<boolean>(true)
const page = ref<'map' | 'charts' | 'charts-add' | 'events' | 'about'>()

const mapLayerSelection = computed(() => route.path === '/' && !!route.hash)

const back = computed(() => {
   const isVisible = !['/', '/charts', '/events'].includes(route.fullPath)
   const title = route.hash
      ? layerStore.getSelectedLayer?.title || t('common.back')
      : t('common.back')
   const previousRoute = router?.options.history?.state?.back || '/'

   return {
      title,
      visible: isVisible,
      route: previousRoute,
   }
})

watch(route, () => {
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
      case '/charts/add': {
         page.value = 'charts-add'
         showFooter.value = false
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
   @apply flex h-full w-[300px] flex-shrink-0 flex-col overflow-y-auto border-r bg-white px-3;

   & .sidebar-footer {
      @apply mt-auto pb-2;
   }
}
</style>
