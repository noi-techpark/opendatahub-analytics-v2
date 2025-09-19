// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
   const sidebarMapContent = ref<boolean>(true)
   const isSidebarVisible = ref<boolean>(false)

   const toggleSidebar = () => {
      isSidebarVisible.value = !isSidebarVisible.value
   }

   return {
      sidebarMapContent,
      isSidebarVisible,
      toggleSidebar,
   }
})
