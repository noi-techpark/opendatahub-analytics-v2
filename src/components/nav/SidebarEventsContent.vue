<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-events-content">
      <div class="checkbox-ct">
         <RouterLink to="/alarms">
            <Checkbox
               :checked="page === 'alarms'"
               rounded
               :label="$t('components.sidebar-events-content.alarms')"
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
const page = ref<'alarms'>()

watch(route, () => {
   switch (route.path) {
      case '/alarms': {
         page.value = 'alarms'
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
 
</style>
