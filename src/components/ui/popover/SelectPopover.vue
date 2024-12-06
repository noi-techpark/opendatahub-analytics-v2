<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
   <Popover v-slot="{ open }" class="relative">
      <PopoverButtonCustom
         ref="popoverButtonCustom"
         :open="open"
         :disabled="disabled"
         :text="text"
      />

      <PopoverTransition>
         <PopoverPanel
            class="absolute left-auto right-0 z-20 mt-2 w-full rounded border bg-white md:w-[300px]"
         >
            <header v-if="showSearch" class="border-b p-2">
               <label
                  for="search"
                  class="mb-2 block text-sm font-semibold text-gray-700"
                  >{{ t('common.search') }}</label
               >
               <InputSearch
                  id="search"
                  v-model="searchQuery"
                  :label-placeholder="searchLabelPlaceholder"
                  type="text"
               />
            </header>
            <Listbox v-model="selectedOption" :disabled="loading">
               <ListboxOptions
                  class="max-h-60 overflow-y-auto overflow-x-hidden"
                  static
               >
                  <ListboxOption
                     v-for="(item, idx) in filteredOptions"
                     :key="idx"
                     :value="item.value"
                     class="cursor-pointer rounded p-2 hover:bg-gray-100"
                     :class="{
                        'cursor-wait opacity-50': loading,
                     }"
                  >
                     <div class="flex items-center gap-2">
                        <input
                           type="checkbox"
                           :checked="selectedOption === item.value"
                           class="h-4 w-4"
                        />
                        <span class="truncate">{{ item.label }}</span>
                     </div>
                  </ListboxOption>
               </ListboxOptions>
            </Listbox>

            <div class="flex justify-between gap-2 border-t p-2">
               <Button grow center outline @click="onCancel">
                  {{ $t('common.cancel') }}
               </Button>
               <Button grow center @click="onSave">
                  {{ $t('common.save') }}
               </Button>
            </div>
         </PopoverPanel>
      </PopoverTransition>
   </Popover>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Popover, PopoverPanel } from '@headlessui/vue'
import { Listbox, ListboxOptions, ListboxOption } from '@headlessui/vue'
import PopoverTransition from './PopoverTransition.vue'
import PopoverButtonCustom from './PopoverButtonCustom.vue'
import { SelectOption } from '../../../types/select'
import InputSearch from '../input/InputSearch.vue'
import { useI18n } from 'vue-i18n'
import Button from '../Button.vue'

import { useDebounceFn } from '@vueuse/core'

const popoverButtonCustom = ref()

const { t } = useI18n()

const selectedOption = defineModel<string | number | undefined>({
   default: [],
})

type Props = {
   text: string
   options: SelectOption[]
   searchLabelPlaceholder?: string
   searchLocally?: boolean
   loading?: boolean
   disabled?: boolean
   showSearch?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits(['save', 'cancel', 'search'])

const searchQuery = ref('')

const filteredOptions = computed(() => {
   if (props.loading) {
      return Array(5).fill({ label: '...', value: '...' })
   }

   return props.searchLocally
      ? props.options.filter(
           (item) =>
              !searchQuery.value ||
              item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      : props.options
})

watch(searchQuery, (newVal) => {
   emitSearch(newVal)
})

const emitSearch = useDebounceFn((value: string) => {
   emit('search', value)
}, 500)

const onSave = () => {
   emit('save')

   popoverButtonCustom.value.clickPopover()
}

const onCancel = () => {
   emit('cancel')

   popoverButtonCustom.value.clickPopover()
}
</script>
