<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="flex select-none items-center justify-between gap-1">
      <span class="flex items-center gap-1 text-gray-900">
         {{ title }}
      </span>

      <div class="flex items-center justify-end gap-1">
         <PopoverCustom>
            <template #trigger>
               <PopoverCustomButton
                  v-slot="{ open }"
                  class="flex items-center rounded"
               >
                  <ArrowDownIcon
                     class="size-5 transition-transform"
                     :class="{ 'rotate-180': open }"
                  />
                  <div class="flex items-center gap-1 text-green">
                     <SortAscIcon v-if="isAsc" class="size-4" />
                     <SortDescIcon v-if="isDesc" class="size-4" />
                  </div>
               </PopoverCustomButton>
            </template>
            <template #container>
               <PopoverCustomPanel v-slot="{ close }">
                  <div class="p-4 pb-0 font-bold text-gray-500">
                     {{ t('components.table.sort') }}
                  </div>
                  <div class="flex items-center gap-3 p-4 pt-2">
                     <div class="flex items-center gap-3 pt-0">
                        <button
                           type="button"
                           class="flex basis-1/2 items-center gap-2 rounded border p-2 leading-tight text-green hover:border-green hover:bg-green/10 focus-visible:border-green focus-visible:bg-green/10 focus-visible:text-green focus-visible:outline-none"
                           @click="onSortClick(isAsc ? 'none' : 'asc', close)"
                        >
                           <div class="flex">
                              <label
                                 class="inline-flex cursor-pointer items-center"
                              >
                                 <input
                                    type="checkbox"
                                    class="size-5 cursor-pointer rounded border-gray-400 accent-green checked:border-green checked:bg-green"
                                    :checked="isAsc"
                                    tabindex="-1"
                                 />
                              </label>
                           </div>
                           <span>{{ t('components.table.ascending') }}</span>
                           <SortAscIcon class="size-4" />
                        </button>
                        <button
                           type="button"
                           class="flex basis-1/2 items-center gap-2 rounded border p-2 leading-tight text-green hover:border-green hover:bg-green/10 focus-visible:border-green focus-visible:bg-green/10 focus-visible:text-green focus-visible:outline-none"
                           @click="onSortClick(isDesc ? 'none' : 'desc', close)"
                        >
                           <div class="flex">
                              <label
                                 class="inline-flex cursor-pointer items-center"
                              >
                                 <input
                                    type="checkbox"
                                    class="size-5 cursor-pointer rounded border-gray-400 accent-green checked:border-green checked:bg-green"
                                    :checked="isDesc"
                                    tabindex="-1"
                                 />
                              </label>
                           </div>
                           <span>{{ t('components.table.descending') }}</span>
                           <SortDescIcon class="size-4" />
                        </button>
                     </div>
                  </div>
               </PopoverCustomPanel>
            </template>
         </PopoverCustom>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import Checkbox from '../ui/Checkbox.vue'
import ArrowDownIcon from '../ui/svg/ArrowDownIcon.vue'
import PopoverCustom from '../ui/popover/PopoverCustom.vue'
import PopoverCustomButton from '../ui/popover/PopoverCustomButton.vue'
import PopoverCustomPanel from '../ui/popover/PopoverCustomPanel.vue'
import SortAscIcon from '../ui/svg/SortAscIcon.vue'
import SortDescIcon from '../ui/svg/SortDescIcon.vue'

const props = defineProps<{
   title: string
   columnKey: string
   currentSortKey: string | null
   currentSortDir: 'asc' | 'desc' | 'none'
}>()

const emit = defineEmits<{
   (
      e: 'update:sort',
      payload: { key: string | null; dir: 'asc' | 'desc' | 'none' }
   ): void
}>()

const { t } = useI18n()

const isAsc = computed(
   () =>
      props.currentSortKey === props.columnKey && props.currentSortDir === 'asc'
)
const isDesc = computed(
   () =>
      props.currentSortKey === props.columnKey &&
      props.currentSortDir === 'desc'
)

const onSortClick = (dir: 'asc' | 'desc' | 'none', close: () => void) => {
   onSelect(dir)
   close()
}

const onSelect = (dir: 'asc' | 'desc' | 'none') => {
   const key = dir === 'none' ? null : props.columnKey
   emit('update:sort', { key, dir })
}
</script>
