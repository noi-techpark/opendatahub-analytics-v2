<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="events-table">
      <Loader :active="loading" />

      <div class="table-scroll-ct">
         <TableWithStickyHeader no-bottom-padding>
            <template #header-cols>
               <TableHeaderCell
                  v-for="header in tableHeaders"
                  :key="header.key"
                  :class="header.class"
               >
                  {{ header.label }}
               </TableHeaderCell>
            </template>

            <template #body-rows>
               <tr v-if="events.length === 0 && !loading">
                  <TableCell colspan="9" class="empty-message">
                     {{ $t('components.events-table.no-events') }}
                  </TableCell>
               </tr>
               <tr v-for="event in events" :key="event.Id" class="table-row">
                  <TableCell>
                     {{ formatDate(event.StartTime) }}
                  </TableCell>
                  <TableCell>
                     {{ event.EndTime ? formatDate(event.EndTime) : '' }}
                  </TableCell>
                  <TableCell>
                     {{ event.EndTime ? $t('common.no') : $t('common.yes') }}
                  </TableCell>
                  <TableCell>
                     {{ event.Source || event._Meta?.Source || '' }}
                  </TableCell>
                  <TableCell>
                     {{ getCategory(event, 1) }}
                  </TableCell>
                  <TableCell>
                     {{ getCategory(event, 2) }}
                  </TableCell>
                  <TableCell>
                     {{ event.Detail?.de?.BaseText || '' }}
                  </TableCell>
                  <TableCell>
                     {{ event.Detail?.it?.BaseText || '' }}
                  </TableCell>
                  <TableCell>
                     {{ event.Shortname || '' }}
                  </TableCell>
               </tr>
            </template>
         </TableWithStickyHeader>
      </div>

      <div class="events-footer">
         <TableFooter
            :pagination="pagination"
            @update:page="onChangePage"
            @update:pageSize="onChangePageSize"
         />
      </div>
   </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'

import Loader from '../Loader.vue'
import TableWithStickyHeader from '../../table/TableWithStickyHeader.vue'
import TableCell from '../../table/TableCell.vue'
import TableHeaderCell from '../../table/TableHeaderCell.vue'
import TableFooter from '../../table/TableFooter.vue'

import { useFetchWithAuth } from '../../../utils/api'
import type { AnnouncementEvent } from '../../../types/api'
import type { TimeRange } from '../../../types/time-series'

const props = defineProps<{
   timeRange?: TimeRange | null
}>()

const { t } = useI18n()

const events = ref<AnnouncementEvent[]>([])
const loading = ref(false)

const tableHeaders = [
   {
      key: 'startTime',
      label: t('components.events-table.start-time'),
      class: 'w-40',
   },
   {
      key: 'endTime',
      label: t('components.events-table.end-time'),
      class: 'w-40',
   },
   {
      key: 'openEnd',
      label: t('components.events-table.open-end-event'),
      class: 'w-40',
   },
   {
      key: 'provider',
      label: t('components.events-table.data-provider'),
      class: 'w-40',
   },
   {
      key: 'category',
      label: t('components.events-table.category'),
      class: 'w-40',
   },
   {
      key: 'subcategory',
      label: t('components.events-table.subcategory'),
      class: 'w-40',
   },
   {
      key: 'descriptionDe',
      label: t('components.events-table.description-de'),
      class: 'w-64',
   },
   {
      key: 'descriptionIt',
      label: t('components.events-table.description-it'),
      class: 'w-64',
   },
   {
      key: 'shortname',
      label: t('components.events-table.shortname'),
      class: 'w-40',
   },
]

const pagination = reactive({
   pageSize: 20,
   totalItems: 0,
   pageCount: 0,
   hasPagination: false,
   hasPrevious: false,
   hasNext: false,
   currentPage: 1,
})

const formatDate = (value: string): string => {
   return format(new Date(value), 'yyyy-MM-dd HH:mm')
}

const getCategory = (event: AnnouncementEvent, index: number): string => {
   if (!event.TagIds || event.TagIds.length <= index) return ''
   const tag = event.TagIds[index]
   return tag || ''
}

const fetchEvents = async () => {
   loading.value = true
   try {
      const baseUrl = import.meta.env.VITE_ODH_CONTENT_API_URI

      const params = new URLSearchParams({
         pagenumber: String(pagination.currentPage),
         pagesize: String(pagination.pageSize),
         tagfilter: 'announcement:traffic-event',
         removenullvalues: 'false',
         getasidarray: 'false',
      })

      if (props.timeRange && props.timeRange[0] && props.timeRange[1]) {
         params.set('begin', props.timeRange[0].toISOString())
         params.set('end', props.timeRange[1].toISOString())
      }

      const url = `${baseUrl}/Announcement?${params.toString()}`

      const { data } = await useFetchWithAuth(url).json()
      const resp = (data.value || {}) as {
         TotalResults?: number
         TotalPages?: number
         CurrentPage?: number
         Items?: AnnouncementEvent[]
      }

      const items = resp.Items || []

      events.value = items
      pagination.totalItems = resp.TotalResults || items.length
      pagination.pageCount = resp.TotalPages || 1
      pagination.currentPage = resp.CurrentPage || pagination.currentPage
      pagination.hasPrevious = pagination.currentPage > 1
      pagination.hasNext = pagination.currentPage < pagination.pageCount
      pagination.hasPagination = pagination.pageCount > 1
   } catch (e) {
      console.error('Failed to fetch events:', e)
   } finally {
      loading.value = false
   }
}

const onChangePage = (page: number) => {
   const target = Math.min(Math.max(1, page), pagination.pageCount || 1)
   if (target !== pagination.currentPage) {
      pagination.currentPage = target
      fetchEvents()
   }
}

const onChangePageSize = (size: number) => {
   if (!size || size <= 0) return
   pagination.pageSize = size
   pagination.currentPage = 1
   fetchEvents()
}

onMounted(() => {
   fetchEvents()
})

watch(
   () => props.timeRange,
   (value) => {
      if (!value || !value[0] || !value[1]) return
      pagination.currentPage = 1
      fetchEvents()
   },
   { deep: true }
)
</script>

<style lang="postcss" scoped>
.events-table {
   @apply relative flex h-full w-full flex-col;

   & .table-scroll-ct {
      @apply min-h-0 flex-1 overflow-y-auto;
   }

   & .events-footer {
      @apply border-t border-gray-200 bg-gray-50;
   }

   & .empty-message {
      @apply px-4 py-4 text-center text-gray-500;
   }

   & .table-row {
      @apply hover:bg-green/10;
   }

   & .table-row:hover {
      @apply bg-green/10;
   }

   /* Make long values wrap within cells instead of overflowing horizontally */
   & :deep(th),
   & :deep(td) {
      word-break: break-word;
   }
}
</style>
