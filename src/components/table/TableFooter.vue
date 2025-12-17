<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="flex items-center justify-end bg-gray-50 py-2 text-xs">
      <span class="mr-3 block">
         {{ t('datasets.listView.rowsPerPage') }}
      </span>
      <SelectPopover
         v-model="selectedPageSize"
         class="mr-6 w-24"
         :options="options"
         :text="selectedPageSizeLabel"
         :show-search="false"
         placement="top"
         @save="onSavePageSize"
      />
      <Paginator
         v-if="pagination.hasPagination"
         id="dataset-table-paginator"
         :pagination="pagination"
         @change-page="onChangePage"
      />
   </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import Paginator from './Paginator.vue'
import SelectPopover from '../ui/popover/SelectPopover.vue'
import type { SelectOption } from '../../types/select'
import { pageSizeOptions } from './pageSizeOptions'

const { t } = useI18n()

type Pagination = {
   pageSize: number
   totalItems: number
   pageCount: number
   hasPagination: boolean
   hasPrevious: boolean
   hasNext: boolean
   currentPage: number
}

const props = defineProps<{ pagination: Pagination }>()

const emit = defineEmits<{
   (e: 'update:page', page: number): void
   (e: 'update:pageSize', pageSize: number): void
}>()

const { pagination } = toRefs(props)

const selectedPageSize = ref(pagination.value.pageSize.toString())

const options = computed<SelectOption[]>(() => {
   if (pagination.value.hasPagination) {
      return pageSizeOptions
   }
   return [
      {
         value: pagination.value.totalItems.toString(),
         label: pagination.value.totalItems.toString(),
      },
   ]
})

const selectedPageSizeLabel = computed(() => {
   const found = options.value.find((o) => o.value === selectedPageSize.value)
   return found?.label || selectedPageSize.value
})

const onSavePageSize = () => {
   const numericSize = Number(selectedPageSize.value)
   if (Number.isNaN(numericSize)) return
   emit('update:pageSize', numericSize)
}

const onChangePage = (page: number) => {
   emit('update:page', page)
}
</script>
