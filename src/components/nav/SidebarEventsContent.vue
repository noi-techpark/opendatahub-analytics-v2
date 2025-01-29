<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-events-content">
      <div class="checkbox-ct">
         <RouterLink to="/events">
            <Checkbox
               :checked="!page"
               rounded
               :label="$t('components.sidebar-events-content.events')"
            />
         </RouterLink>
         <RouterLink to="/events/weather">
            <Checkbox
               :checked="page === 'weather'"
               rounded
               :label="$t('components.sidebar-events-content.weather')"
            />
         </RouterLink>
      </div>
      <Divider />
   </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import Checkbox from '../ui/Checkbox.vue'
import { useRoute } from 'vue-router'
import Divider from '../ui/Divider.vue'

type Props = {}
const props = withDefaults(defineProps<Props>(), {})

const route = useRoute()
const page = ref<'events' | 'weather'>()

watch(route, () => {
   switch (route.path) {
      case '/events': {
         page.value = undefined
         break
      }
      case '/events/weather': {
         page.value = 'weather'
         break
      }
   }
})
</script>

<style lang="postcss" scoped>
.sidebar-events-content {
   @apply flex flex-col;

   & .checkbox-ct {
      @apply flex flex-col px-3;
   }
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-events-content {
   }
}
</style>
