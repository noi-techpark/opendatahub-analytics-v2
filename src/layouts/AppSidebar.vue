<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <aside class="app-sidebar">
    <div class="sidebar-navigation">
      <SidebarMapHeader v-if="page === 'map'" />
    </div>

    <Divider />

    <div class="sidebar-content">
      <SidebarMapContent v-if="page === 'map' && !!route.hash" />
      <SidebarChartsContent v-if="page === 'charts'" />
      <SidebarEventsContent v-if="page === 'events'" />
    </div>

    <div class="sidebar-footer">
      <Divider />
      <div v-if="mapLayerSelection">ALARMS</div>

      <RouterLink to="/about" v-else>
        <IconText :text="$t('common.about')">
          <IconInfo />
        </IconText>
      </RouterLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import SidebarMapContent from '../components/nav/SidebarMapContent.vue'
import SidebarChartsContent from '../components/nav/SidebarChartsContent.vue'
import SidebarEventsContent from '../components/nav/SidebarEventsContent.vue'
import IconText from '../components/ui/IconText.vue'
import IconInfo from '../components/tmp/components/svg/IconInfo.vue'
import SidebarMapHeader from '../components/nav/SidebarMapHeader.vue'
import Divider from '../components/ui/Divider.vue'

const route = useRoute()

const mapLayerSelection = computed(() => route.path === '/' && !!route.hash)
const page = computed((): 'map' | 'charts' | 'events' | 'about' | undefined => {
  switch (route.path) {
    case '/':
      return 'map'
    case '/charts':
      return 'charts'
    case '/events':
      return 'events'
    case '/about':
      return 'about'
  }
})
</script>

<style lang="postcss" scoped>
.app-sidebar {
  @apply w-[300px] z-10 bg-white border-r border-stroke flex flex-col overflow-y-auto h-full px-3;

  & .sidebar-navigation {
    @apply flex flex-col;
  }

  & .sidebar-footer {
    @apply pb-2 mt-auto;
  }
}
</style>
