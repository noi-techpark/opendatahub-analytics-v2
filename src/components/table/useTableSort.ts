// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ref, computed } from 'vue'

export type SortDir = 'asc' | 'desc' | 'none'

export const useTableSort = (initialKey: string | null = null, initialDir: SortDir = 'none') => {
  const sortKey = ref<string | null>(initialKey)
  const sortDir = ref<SortDir>(initialDir)

  const isActive = computed(() => sortKey.value != null && sortDir.value !== 'none')

  const setSort = (key: string | null, dir: SortDir) => {
    sortKey.value = key
    sortDir.value = dir
  }

  const toggle = (key: string) => {
    if (sortKey.value !== key) {
      sortKey.value = key
      sortDir.value = 'asc'
      return
    }
    sortDir.value = sortDir.value === 'asc' ? 'desc' : sortDir.value === 'desc' ? 'none' : 'asc'
    if (sortDir.value === 'none') sortKey.value = null
  }

  return { sortKey, sortDir, isActive, setSort, toggle }
}
