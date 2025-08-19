<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="alarm-table">
      <Loader :active="loading" />

      <div class="table-container">
         <table class="alarm-table-content">
            <thead>
               <tr class="table-header">
                  <th
                     v-for="header in tableHeaders"
                     :key="header.key"
                     class="table-cell"
                  >
                     {{ header.label }}
                  </th>
               </tr>
            </thead>
            <tbody>
               <tr v-if="filteredAlarms.length === 0">
                  <td colspan="8" class="empty-message">
                     {{ $t('components.alarm-table.no-alarms') }}
                  </td>
               </tr>
               <tr
                  v-for="alarm in filteredAlarms"
                  :key="`${alarm.stationName}-${alarm.measurement}-${alarm.alarm.name}`"
                  :class="getRowClass(alarm.alarm.priority)"
               >
                  <td
                     v-for="header in tableHeaders"
                     :key="header.key"
                     class="table-cell"
                  >
                     <template v-if="header.key === 'priority'">
                        <span
                           :class="getPriorityBadgeClass(alarm.alarm.priority)"
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
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { AlarmEvent } from '../../../types/alarm-config'
import Loader from '../Loader.vue'

const props = defineProps<{
   alarms: AlarmEvent[]
   loading: boolean
}>()

const { t } = useI18n()

const tableHeaders = [
   { key: 'priority', label: t('components.alarm-table.priority.title') },
   { key: 'timestamp', label: t('components.alarm-table.timestamp') },
   { key: 'measurement', label: t('components.alarm-table.measurement') },
   { key: 'stationName', label: t('components.alarm-table.station') },
   { key: 'coordinates', label: t('components.alarm-table.coordinates') },
   { key: 'alarmName', label: t('components.alarm-table.alarm') },
   { key: 'description', label: t('components.alarm-table.description') },
   { key: 'value', label: t('components.alarm-table.value') },
]

const filteredAlarms = computed(() => {
   return props.alarms
})

const formatDate = (date: Date): string => {
   return format(date, 'yyyy-MM-dd HH:mm:ss')
}

const formatCoordinates = (coordinates: [number, number]): string => {
   return `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`
}

const getRowClass = (priority: string): string => {
   switch (priority) {
      case 'high':
         return 'bg-red-50/80'
      case 'medium':
         return 'bg-orange-50/60'
      default:
         return ''
   }
}

const getPriorityBadgeClass = (priority: string): string => {
   const baseClasses = 'px-2 py-1 rounded text-xs font-semibold'
   switch (priority) {
      case 'high':
         return `${baseClasses} bg-red-100 text-red-800`
      case 'medium':
         return `${baseClasses} bg-orange-100 text-orange-600`
      case 'low':
         return `${baseClasses} bg-grey text-black`
      default:
         return baseClasses
   }
}
</script>

<style lang="postcss" scoped>
.alarm-table {
   @apply relative w-full;

   & .table-container {
      @apply overflow-x-auto;
   }

   & .alarm-table-content {
      @apply min-w-full border border-gray-200 bg-white;

      & .table-header {
         @apply bg-gray-100;
      }

      & .table-cell {
         @apply border-b px-4 py-2 text-left;
      }

      & .empty-message {
         @apply px-4 py-4 text-center text-gray-500;
      }
   }
}
</style>
