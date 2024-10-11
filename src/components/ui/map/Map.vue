<template>
  <div class="map-ct">
    <div class="loading-ct" :class="{ active: loading || !mapLoaded }">
      <SpinnerIcon class="loading-indicator animate-spin" />
    </div>
    <div id="map" />
  </div>
</template>

<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import { onMounted, ref, watch } from 'vue'
import SpinnerIcon from '../../icons/SpinnerIcon.vue'
import { DataPoint } from '../../../types/api'
import {
  createPointLayer,
  createPointSource,
  initMap,
} from '../../../utils/map-utils'
import { Map } from 'maplibre-gl'

type PointCache = {
  [key: string]: {
    coordinates: [number, number]
    layerId: string
    sourceId: string
  }
}

type Props = {
  loading?: boolean
  points?: DataPoint[]
}
const props = withDefaults(defineProps<Props>(), {})

const mapLoaded = ref<boolean>()
const map = ref<Map>()

const pointCache: PointCache = {}

const updatePoints = (curr?: DataPoint[], old?: DataPoint[]) => {
  if (!map.value) return

  const currentPoints = new Set(curr?.map((p) => p.scode) || [])
  const oldPoints = new Set(old?.map((p) => p.scode) || [])

  for (const scode of oldPoints) {
    if (!currentPoints.has(scode)) {
      const cache = pointCache[scode]
      if (cache) {
        if (map.value.getLayer(cache.layerId)) {
          map.value.removeLayer(cache.layerId)
        }
        if (map.value.getSource(cache.sourceId)) {
          map.value.removeSource(cache.sourceId)
        }
        delete pointCache[scode]
      }
    }
  }

  curr?.forEach((point) => {
    const sourceId = `point-source-${point.scode}`
    const layerId = `point-layer-${point.scode}`
    const coordinates: [number, number] = [
      point.scoordinate.x,
      point.scoordinate.y,
    ]

    const cached = pointCache[point.scode]

    if (
      cached &&
      cached.coordinates[0] === coordinates[0] &&
      cached.coordinates[1] === coordinates[1]
    ) {
      return
    }

    if (cached) {
      if (map.value?.getLayer(layerId)) {
        map.value?.removeLayer(layerId)
      }
      if (map.value?.getSource(sourceId)) {
        map.value?.removeSource(sourceId)
      }
    }

    map.value?.addSource(sourceId, createPointSource(point))
    map.value?.addLayer(createPointLayer(point))

    pointCache[point.scode] = {
      coordinates,
      layerId,
      sourceId,
    }
  })
}

watch(
  [() => props.points, () => mapLoaded.value],
  ([currPoints, mapLoadedCurr], [oldPoints]) => {
    if (mapLoadedCurr) {
      updatePoints(currPoints, oldPoints)
    }
  }
)

onMounted(() => {
  map.value = initMap()
  map.value.on('load', () => {
    mapLoaded.value = map.value?.loaded()
  })
})
</script>

<style lang="postcss" scoped>
.map-ct {
  @apply absolute inset-0 w-full h-screen z-[1];

  & .loading-ct {
    @apply opacity-0 flex items-center justify-center absolute inset-0 bg-black/50 z-[999] pointer-events-none transition-all;

    & .loading-indicator {
      @apply text-white size-10;
    }

    &.active {
      @apply opacity-100 pointer-events-auto;
    }
  }

  & #map {
    @apply w-full h-full;
  }
}
</style>
