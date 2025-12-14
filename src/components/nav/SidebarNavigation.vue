<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div>
      <div class="sidebar-navigation">
         <MenuButtons
            :links="linksWithActions"
            :selected-id="selectedId"
            grow
         />
      </div>

      <RouterLink
         v-if="back?.visible && !hideBack"
         :to="{ path: back?.route, query: route.query }"
         class="back-link"
         @click="onBackClick"
      >
         <IconText :text="back?.title" class="w-full">
            <ArrowLeftIcon />
         </IconText>
      </RouterLink>
   </div>

   <Divider v-if="back?.visible && !hideBack" :noTop="!!back?.visible" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import IconText from '../ui/IconText.vue'
import ArrowLeftIcon from '../ui/svg/ArrowLeftIcon.vue'
import Divider from '../ui/Divider.vue'
import MenuButtons from '../ui/MenuButtons.vue'
import { useLayoutStore } from '../../stores/layout'
import { storeToRefs } from 'pinia'

type Props = {
   back?: {
      visible: boolean
      title: string
      route: string
   }
   hideBack?: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const route = useRoute()
const { t } = useI18n()
const selectedId = ref<string>('map')
const layoutStore = useLayoutStore()
const { sidebarMapContent } = storeToRefs(layoutStore)

const links = computed(() => [
   { id: 'map', title: t('components.sidebar.map'), route: '/' },
   { id: 'charts', title: t('components.sidebar.charts'), route: '/charts' },
   { id: 'alarms', title: t('components.sidebar.alarms'), route: '/alarms' },
   { id: 'events', title: t('components.sidebar.events'), route: '/events' },
])

const linksWithActions = computed(() =>
   links.value.map((link) => ({
      ...link,
      action: onLinkClick,
   }))
)

watch(route, () => {
   const id = links.value.find((item) => item.route === route.path)?.id

   if (id) {
      selectedId.value = id
   }

   return id
})

const onBackClick = () => {
   sidebarMapContent.value = false
}

const onLinkClick = () => {
   // Close sidebar on mobile when a navigation link is clicked
   if (window.innerWidth < 768) {
      layoutStore.isSidebarVisible = false
   }
}

onMounted(() => {
   switch (route.path) {
      case '/charts':
         selectedId.value = 'charts'
         break
      case '/alarms':
         selectedId.value = 'alarms'
         break
      case '/events':
         selectedId.value = 'events'
         break
      default:
         selectedId.value = 'map'
         break
   }
})
</script>

<style lang="postcss" scoped>
.sidebar-navigation {
   @apply flex justify-center px-3 py-2;
}

.back-link {
   @apply inline-block w-full;
}

@media (max-width: theme('screens.md')) {
   .sidebar-navigation {
      @apply px-4;
   }
}
</style>
