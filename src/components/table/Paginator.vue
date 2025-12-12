<!-- eslint-disable vue/multi-word-component-names -->

<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="flex items-center">
      <button
         :id="`${id}-previous-page`"
         class="mr-4 rounded"
         :class="[pagination.hasPrevious ? 'text-green-500' : 'text-gray-400']"
         :disabled="!pagination.hasPrevious"
         :data-test="`${id}-previous-page`"
         @click="onChangePage(pagination.currentPage - 1)"
      >
         <ArrowDownIcon class="size-5 rotate-90 stroke-current" />
      </button>

      <div class="mr-2 flex items-center">
         <input
            :id="`${id}-page-input`"
            v-model="inputPageValue"
            class="border-r-none border-grey-input focus:border-green-500 h-6 w-12 rounded rounded-r-none border-y border-l px-2"
            :data-test="`${id}-page-input`"
            @keyup.enter="onChangePage(inputPageValue)"
         />
         <Button
            :id="`${id}-paginate-to`"
            class="!min-w-0 !rounded-l-none"
            small
            :data-test="`${id}-paginate-to`"
            @click="onChangePage(inputPageValue)"
         >
            {{ t('datasets.listView.go') }}
         </Button>
      </div>
      <span class="mr-4">{{ pageOfManyLabel }}</span>

      <button
         :id="`${id}-next-page`"
         class="rounded"
         :class="[pagination.hasNext ? 'text-green-500' : 'text-gray-400']"
         :disabled="!pagination.hasNext"
         :data-test="`${id}-next-page`"
         @click="onChangePage(pagination.currentPage + 1)"
      >
         <ArrowDownIcon class="size-5 -rotate-90 stroke-current" />
      </button>
   </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '../ui/Button.vue'
import ArrowDownIcon from '../ui/svg/ArrowDownIcon.vue'

const { t } = useI18n()

const props = defineProps<{
   pagination: {
      currentPage: number
      pageCount: number
      hasPrevious: boolean
      hasNext: boolean
      hasPagination: boolean
   }
   id: string
}>()

const emit = defineEmits<{
   (e: 'change-page', page: number): void
}>()

const inputPageValue = ref(props.pagination.currentPage)

watch(
   () => props.pagination,
   (pagination) => (inputPageValue.value = pagination.currentPage)
)

const pageOfManyLabel = computed(() =>
   props.pagination.pageCount === Infinity
      ? t('datasets.listView.ofUnknown')
      : t('datasets.listView.of', { pageCount: props.pagination.pageCount })
)

const onChangePage = (page: number | string) => {
   const numericPage = typeof page === 'string' ? Number(page) : page
   if (Number.isNaN(numericPage)) return
   emit('change-page', numericPage)
}
</script>
