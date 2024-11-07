<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-charts-content">
      <RouterLink to="/charts/add">
         <Button :value="$t('components.sidebar-charts-content.add')">
            <AddIcon />
         </Button>
      </RouterLink>
   </div>
</template>

<script lang="ts" setup>
import Button from '../ui/Button.vue'
import AddIcon from '../ui/svg/AddIcon.vue'

type Props = {}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.sidebar-charts-content {
   @apply px-3;
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-charts-content {
   }
}
</style>
