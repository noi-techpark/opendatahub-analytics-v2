<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-navigation" :class="{ back: back?.visible }">
      <RouterLink v-if="back?.visible" :to="back?.route">
         <IconText :text="back?.title">
            <ArrowLeftIcon />
         </IconText>
      </RouterLink>

      <MenuButtons v-else :links :selectedIdx="selectedIdx" grow />
   </div>

   <Divider v-if="back?.visible" :noTop="back?.visible" />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import IconText from '../ui/IconText.vue'
import ArrowLeftIcon from '../ui/svg/ArrowLeftIcon.vue'
import Divider from '../ui/Divider.vue'
import MenuButtons from '../ui/MenuButtons.vue'

type Props = {
   back?: {
      visible: boolean
      title: string
      route: string
   }
}
const props = withDefaults(defineProps<Props>(), {})

const route = useRoute()
const { t } = useI18n()
const selectedIdx = ref<number>(0)

const links = computed(() => [
   { title: t('components.sidebar.map'), route: '/' },
   { title: t('components.sidebar.charts'), route: '/charts' },
   { title: t('components.sidebar.events'), route: '/events' },
])

watch(route, () => {
   const routes = ['/', '/charts', '/events']
   selectedIdx.value = routes.indexOf(route.path)

   return selectedIdx.value === 0
      ? 'map'
      : selectedIdx.value === 1
        ? 'charts'
        : selectedIdx.value === 2
          ? 'events'
          : undefined
})
</script>

<style lang="postcss" scoped>
.sidebar-navigation {
   @apply flex justify-center px-3 py-2;

   &.back {
      @apply justify-normal;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-navigation {
   }
}
</style>
