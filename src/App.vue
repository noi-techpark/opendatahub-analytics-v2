<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="page-ct">
      <AppLayout>
         <div class="main-ct">
            <RouterView />
         </div>
      </AppLayout>
   </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
</script>

<style lang="postcss" scoped>
.main-ct {
   @apply relative flex-shrink flex-grow overflow-y-auto px-6 py-2;
}
</style>
