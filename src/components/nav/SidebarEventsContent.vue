<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="sidebar-events-content">events content</div>
</template>

<script lang="ts" setup>
type Props = {}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.sidebar-events-content {
}

@media only screen and (max-width: theme('screens.md')) {
   .sidebar-events-content {
   }
}
</style>
