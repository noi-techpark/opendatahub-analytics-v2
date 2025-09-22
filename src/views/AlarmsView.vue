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

      <AlarmsTable
         :alarms="activeAlarms"
         :loading="loading"
         :has-selection="layerStore.getSelectedLayers.length > 0"
      />
   </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import AlarmsTable from '../components/ui/alarm/AlarmsTable.vue'
import { AlarmEvent } from '../types/alarm-config'
import {
   StationMeasurement,
   getAllActiveAlarms,
} from '../utils/alarm-evaluator'
import { useAutoRefreshStore } from '../stores/auto-refresh'
import { useLayerDataStore } from '../stores/layer-data'
import { useLayerDataFetcher } from '../composables/useLayerDataFetcher'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useMapLayerStore } from '../stores/map-layers'
import { useQueryInit } from '../composables/useQueryInit'

const activeAlarms = ref<AlarmEvent[]>([])
const loading = ref(true)
const autoRefreshStore = useAutoRefreshStore()
const layerDataStore = useLayerDataStore()
const { alarmConfig } = storeToRefs(layerDataStore)
const { t } = useI18n()
const layerStore = useMapLayerStore()
const { selectedFilterOrigins, uniqueOrigins } = storeToRefs(layerStore)

async function fetchAndEvaluateAlarms() {
   loading.value = true
   try {
      const { getMeasurementsForSelectedLayers } = useLayerDataFetcher()
      const measurements: StationMeasurement[] =
         await getMeasurementsForSelectedLayers(layerStore.getSelectedLayers, {
            selectedFilterOrigins: selectedFilterOrigins.value,
            t,
         })

      activeAlarms.value = getAllActiveAlarms(measurements, alarmConfig.value)
   } catch (error) {
      console.error('Error fetching and evaluating alarms:', error)
   } finally {
      loading.value = false
   }
}

async function loadConfig() {
   try {
      const { ensureAlarmConfigLoaded } = useLayerDataFetcher()
      await ensureAlarmConfigLoaded()
   } catch (error) {
      console.error('Error ensuring alarm configuration:', error)
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

watch(
   selectedFilterOrigins,
   () => {
      const { saveToUrl } = useQueryInit()
      saveToUrl()
      fetchAndEvaluateAlarms()
   },
   { deep: true }
)

watch(
   () => layerStore.getSelectedLayers,
   async (curr) => {
      const { saveToUrl } = useQueryInit()
      saveToUrl()
      await fetchAndEvaluateAlarms()
   },
   { deep: true }
)

onMounted(async () => {
   await loadConfig()
   const { initFromUrl } = useQueryInit()
   initFromUrl({ restoreSessionHash: true })
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
