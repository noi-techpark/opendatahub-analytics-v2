<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="alarm-table">
      <Loader :active="loading" />

      <TableWithStickyHeader>
         <template #header-cols>
            <TableHeaderCell
               v-for="header in tableHeaders"
               :key="header.key"
               :class="header.class"
            >
               <SortHeader
                  :title="header.label"
                  :column-key="header.key"
                  :current-sort-key="sortKey"
                  :current-sort-dir="sortDir"
                  @update:sort="onUpdateSort"
               />
            </TableHeaderCell>
         </template>
         <template #body-rows>
            <tr v-if="sortedAlarms.length === 0">
               <TableCell colspan="8" class="empty-message">
                  {{
                     hasSelection
                        ? $t('components.alarm-table.no-alarms')
                        : $t(
                             'components.alarm-table.select-station-to-see-alarms'
                          )
                  }}
               </TableCell>
            </tr>
            <tr
               v-for="alarm in sortedAlarms"
               :key="`${alarm.stationName}-${alarm.measurement}-${alarm.alarm.name}`"
               class="__clickable table-row"
               @click="navigateToMap(alarm)"
            >
               <TableCell v-for="header in tableHeaders" :key="header.key">
                  <template v-if="header.key === 'priority'">
                     <span
                        :class="getPriorityBadgeClass(alarm.alarm.priority)"
                        :style="{
                           backgroundColor: getColorForPriority(
                              alarm.alarm.priority
                           ),
                        }"
                     >
                        {{
                           $t(
                              `components.alarm-table.priority.${alarm.alarm.priority}`
                           )
                        }}
                     </span>
                  </template>
                  <template v-else-if="header.key === 'timestamp'">
                     {{ formatDate(alarm.timestamp) }}
                  </template>
                  <template v-else-if="header.key === 'measurement'">
                     {{ alarm.measurement }}
                  </template>
                  <template v-else-if="header.key === 'stationName'">
                     {{ alarm.stationName }}
                  </template>
                  <template v-else-if="header.key === 'coordinates'">
                     {{ formatCoordinates(alarm.coordinates) }}
                  </template>
                  <template v-else-if="header.key === 'alarmName'">
                     {{ alarm.alarm.name }}
                  </template>
                  <template v-else-if="header.key === 'description'">
                     {{ alarm.alarm.description }}
                  </template>
                  <template v-else-if="header.key === 'value'">
                     {{ alarm.value }}
                  </template>
               </TableCell>
            </tr>
         </template>
      </TableWithStickyHeader>
   </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { useRouter, useRoute } from 'vue-router'

import { AlarmEvent } from '../../../types/alarm-config'

import Loader from '../Loader.vue'
import TableWithStickyHeader from '../../table/TableWithStickyHeader.vue'
import TableCell from '../../table/TableCell.vue'
import TableHeaderCell from '../../table/TableHeaderCell.vue'
import SortHeader from '../../table/SortHeader.vue'
import { useTableSort, type SortDir } from '../../table/useTableSort'
import { getColorForPriority } from '../../../utils/marker-utils'

const props = defineProps<{
   alarms: AlarmEvent[]
   loading: boolean
   hasSelection?: boolean
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const tableHeaders = [
   {
      key: 'priority',
      label: t('components.alarm-table.priority.title'),
      class: 'w-32',
   },
   {
      key: 'timestamp',
      label: t('components.alarm-table.timestamp'),
      class: 'w-44',
   },
   {
      key: 'measurement',
      label: t('components.alarm-table.measurement'),
      class: 'w-44',
   },
   {
      key: 'stationName',
      label: t('components.alarm-table.station'),
      class: 'w-44',
   },
   {
      key: 'coordinates',
      label: t('components.alarm-table.coordinates'),
      class: 'w-44',
   },
   {
      key: 'alarmName',
      label: t('components.alarm-table.alarm'),
      class: 'w-44',
   },
   {
      key: 'description',
      label: t('components.alarm-table.description'),
      class: 'w-44',
   },
   {
      key: 'value',
      label: t('components.alarm-table.value'),
      class: 'w-32',
   },
]

const { sortKey, sortDir, setSort } = useTableSort(null, 'none')

const onUpdateSort = (payload: { key: string | null; dir: SortDir }) => {
   setSort(payload.key, payload.dir)
}

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }

const compareValues = (a: unknown, b: unknown, key: string): number => {
   // Custom handling per column
   if (key === 'priority') {
      const av = priorityOrder[(a as string) || 'low'] || 0
      const bv = priorityOrder[(b as string) || 'low'] || 0
      return av - bv
   }
   if (key === 'timestamp') {
      const av =
         a instanceof Date ? a.getTime() : new Date(a as string).getTime()
      const bv =
         b instanceof Date ? b.getTime() : new Date(b as string).getTime()
      return av - bv
   }
   if (typeof a === 'number' && typeof b === 'number') return a - b
   return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
   })
}

const sortedAlarms = computed(() => {
   if (!sortKey.value || sortDir.value === 'none') return props.alarms

   const key = sortKey.value
   const dir = sortDir.value

   const getFieldValue = (alarm: AlarmEvent): unknown => {
      switch (key) {
         case 'priority':
            return alarm.alarm.priority
         case 'timestamp':
            return alarm.timestamp
         case 'measurement':
            return alarm.measurement
         case 'stationName':
            return alarm.stationName
         case 'coordinates':
            return alarm.coordinates?.join(', ') || ''
         case 'alarmName':
            return alarm.alarm.name
         case 'description':
            return alarm.alarm.description
         case 'value':
            return alarm.value as unknown as number | string
         default:
            return ''
      }
   }

   return [...props.alarms].sort((a, b) => {
      const av = getFieldValue(a)
      const bv = getFieldValue(b)
      const cmp = compareValues(av, bv, key)
      return dir === 'asc' ? cmp : -cmp
   })
})

const formatDate = (date: Date): string => {
   return format(date, 'yyyy-MM-dd HH:mm:ss')
}

const formatCoordinates = (coordinates: [number, number]): string => {
   return `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
}

const getPriorityBadgeClass = (priority: string): string => {
   const baseClasses = 'px-2 py-1 rounded text-xs font-semibold'
   switch (priority) {
      case 'high':
         return `${baseClasses} text-white `
      case 'medium':
         return `${baseClasses} text-white`
      case 'low':
         return `${baseClasses} text-white`
      default:
         return baseClasses
   }
}

const navigateToMap = (alarm: AlarmEvent) => {
   const query = {
      ...route.query,
      focusName: alarm.stationName,
      focusCoords: alarm.coordinates
         ? `${alarm.coordinates[0]},${alarm.coordinates[1]}`
         : undefined,
      focusPriority: alarm.alarm.priority,
   } as Record<string, string>

   router.push({ name: 'map', query, hash: '#stations' })
}
</script>

<style lang="postcss" scoped>
.alarm-table {
   @apply relative w-full;

   & .empty-message {
      @apply px-4 py-4 text-center text-gray-500;
   }

   & .table-row {
      @apply hover:bg-green/10;
   }

   & .table-row:hover {
      @apply bg-green/10;
   }
}
</style>
