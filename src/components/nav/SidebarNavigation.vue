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

    <RouterLink
      v-else
      v-for="(item, i) in links"
      class="sidebar-link"
      :class="{
        selected: page === item.id,
        first: i === 0,
        last: i === links.length - 1,
      }"
      :to="item.route"
    >
      {{ item.title }}
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import IconText from '../ui/IconText.vue'
import ArrowLeftIcon from '../ui/svg/ArrowLeftIcon.vue'

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

const links = computed(() => [
  { title: t('components.sidebar.map'), route: '/', id: 'map' },
  { title: t('components.sidebar.charts'), route: '/charts', id: 'charts' },
  { title: t('components.sidebar.events'), route: '/events', id: 'events' },
])

const page = computed((): 'map' | 'charts' | 'events' | undefined => {
  switch (route.path) {
    case '/':
      return 'map'
    case '/charts':
      return 'charts'
    case '/events':
      return 'events'
  }
})
</script>

<style lang="postcss" scoped>
.sidebar-navigation {
  @apply flex justify-center py-2 px-3;

  &.back {
    @apply justify-normal;
  }

  & .sidebar-link {
    @apply px-5 py-1 font-semibold text-sm border border-l-0 border-stroke transition-all bg-grey;

    &.first {
      @apply rounded-l-small border-l;
    }
    &.last {
      @apply rounded-r-small;
    }
    &.selected {
      @apply text-white bg-green border-green;
    }
  }
}

@media only screen and (max-width: theme('screens.md')) {
  .sidebar-navigation {
  }
}
</style>
