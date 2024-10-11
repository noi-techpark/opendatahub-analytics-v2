<template>
  <main class="main">
    <Map :loading="loading > 0" :points />
  </main>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import Map from '../components/ui/map/Map.vue'
import { useLayerStore } from '../stores/map-layers'
import { useFetch } from '@vueuse/core'
import { FlatResponse, DataPoint } from '../types/api'

const layerStore = useLayerStore()
const loading = ref<number>(0)
const points = ref<DataPoint[]>([])

watchEffect(async () => {})

watch(
  () => layerStore.getSelectedLayers,
  async (curr, old) => {
    const latestSelected = curr.at(-1)

    if (latestSelected && curr.length > old.length) {
      loading.value += 1
      const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${latestSelected.stationType[0]}/?limit=-1&distinct=true&select=scoordinate%2Cscode%2Cstype&where=`
      const res = (await useFetch(url)).text()
      const data = JSON.parse(res.data.value || '') as FlatResponse

      if (data) {
        points.value = [...points.value, ...data.data]
      }

      loading.value -= 1
    } else {
      const newTypes = curr.map((n) => n.stationType[0])
      const oldTypes = old.map((o) => o.stationType[0])
      const diff = oldTypes.filter((ot) => !newTypes.includes(ot))

      diff.forEach(
        (d) => (points.value = points.value.filter((p) => p.stype !== d))
      )
    }
  },
  { deep: true }
)
</script>

<style lang="postcss" scoped>
.main {
}

@media (max-width: theme('screens.md')) {
}
</style>
