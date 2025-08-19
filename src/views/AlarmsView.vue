<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="alarms-view">
      <div class="alarms-header">
         <H tag="h1">{{ $t('views.alarms.title') }}</H>
         <P>{{ $t('views.alarms.description') }}</P>
      </div>

      <AlarmTable :alarms="activeAlarms" :loading="loading" />
   </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import AlarmTable from '../components/ui/alarm/AlarmTable.vue'
import {
   loadAlarmConfig,
   getDefaultAlarmConfigUrl,
} from '../utils/alarm-config-loader'
import { AlarmConfig, AlarmEvent } from '../types/alarm-config'
import {
   StationMeasurement,
   getAllActiveAlarms,
} from '../utils/alarm-evaluator'
import { useAutoRefreshStore } from '../stores/auto-refresh'

const alarmConfig = ref<AlarmConfig>({})
const activeAlarms = ref<AlarmEvent[]>([])
const loading = ref(true)
const autoRefreshStore = useAutoRefreshStore()

const mockMeasurements: StationMeasurement[] = [
   {
      stationType: 'MeteoStation',
      measurement: 'precipitation',
      value: 1.5,
      timestamp: new Date(),
      stationName: 'Bolzano Central',
      coordinates: [46.4983, 11.3548],
   },
   {
      stationType: 'MeteoStation',
      measurement: 'air-temperature',
      value: -2,
      timestamp: new Date(),
      stationName: 'Merano Station',
      coordinates: [46.6698, 11.1695],
   },
   {
      stationType: 'EnvironmentStation',
      measurement: 'nitrogen-dioxide',
      value: 55,
      timestamp: new Date(),
      stationName: 'Bressanone Air Quality',
      coordinates: [46.7168, 11.6572],
   },
   {
      stationType: 'RWISstation',
      measurement: 'ground-surface-temperature',
      value: -3,
      timestamp: new Date(),
      stationName: 'Highway A22 - Km 85',
      coordinates: [46.3052, 11.2887],
   },
]

async function fetchAndEvaluateAlarms() {
   loading.value = true
   try {
      const measurements = mockMeasurements.map((m) => ({
         ...m,
         timestamp: new Date(),
      }))

      // Evaluate alarms based on the measurements and config
      activeAlarms.value = getAllActiveAlarms(measurements, alarmConfig.value)
   } catch (error) {
      console.error('Error fetching and evaluating alarms:', error)
   } finally {
      setTimeout(() => {
         loading.value = false
      }, 1000)
   }
}

async function loadConfig() {
   try {
      alarmConfig.value = await loadAlarmConfig(getDefaultAlarmConfigUrl())
   } catch (error) {
      console.error('Error loading alarm configuration:', error)
   }
}

watch(
   () => autoRefreshStore.lastRefreshTime,
   (newTime) => {
      if (newTime) {
         fetchAndEvaluateAlarms()
      }
   }
)

onMounted(async () => {
   await loadConfig()
   await fetchAndEvaluateAlarms()
})
</script>

<style lang="postcss" scoped>
.alarms-view {
   & .alarms-header {
      @apply mb-6;
   }
}
</style>
