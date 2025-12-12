<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
   <Popover v-slot="{ open }" class="relative">
      <SelectPopoverButtonCustom
         ref="popoverButtonCustom"
         :open="open"
         :disabled="disabled"
         :loading="loading"
         :text="text"
      />

      <PopoverTransition>
         <PopoverPanel
            :class="[
               'absolute left-auto right-0 z-20 w-full rounded border bg-white md:w-[300px]',
               placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
            ]"
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
            <Listbox
               v-model="selectedOption"
               :disabled="loading"
               :multiple="multiple"
            >
               <ListboxOptions
                  ref="listboxRef"
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
                           :checked="
                              multiple && Array.isArray(selectedOption)
                                 ? selectedOption.includes(item.value)
                                 : selectedOption === item.value
                           "
                           class="h-4 w-4"
                        />
                        <span class="truncate">{{ item.label }}</span>
                     </div>
                  </ListboxOption>
               </ListboxOptions>
            </Listbox>

            <span
               v-if="!loading && !filteredOptions.length"
               class="inline-block p-2 text-sm"
               >{{ t('components.select.no-option-found') }}</span
            >

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
import SelectPopoverButtonCustom from './SelectPopoverButtonCustom.vue'
import { SelectOption } from '../../../types/select'
import InputSearch from '../input/InputSearch.vue'
import { useI18n } from 'vue-i18n'
import Button from '../Button.vue'

import { useDebounceFn, useEventListener } from '@vueuse/core'

const popoverButtonCustom = ref()
const listboxRef = ref()

const { t } = useI18n()

const selectedOption = defineModel<string | number | undefined | string[]>({
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
   multiple?: boolean
   placement?: 'bottom' | 'top'
}

const props = withDefaults(defineProps<Props>(), {
   placement: 'bottom',
})

const emit = defineEmits(['save', 'cancel', 'search', 'scrollEnd'])

const searchQuery = ref('')

const filteredOptions = computed(() => {
   const options = props.options || []
   if (props.loading) {
      const placeholderItems = options.length ? 1 : 5
      return [
         ...options,
         ...Array(placeholderItems).fill({ label: '...', value: '...' }),
      ]
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

const handleScroll = () => {
   if (props.loading || props.disabled) return

   const listbox = listboxRef.value

   if (listbox) {
      const { scrollTop, scrollHeight, clientHeight } = listbox.$el
      if (scrollTop + clientHeight >= scrollHeight - 100) {
         emit('scrollEnd')
      }
   }
}

useEventListener(listboxRef, 'scroll', handleScroll)
</script>
