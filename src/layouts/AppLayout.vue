<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="app-layout">
    <AppHeader :is-menu-open="isMenuOpen" @toggle-menu="toggleMenu" />
    <div class="content-ct">
      <AppSidebar />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { ref } from 'vue'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style lang="postcss" scoped>
.app-layout {
  @apply flex h-screen flex-col overflow-y-auto;

  & .content-ct {
    @apply flex h-full;
  }
}
</style>
