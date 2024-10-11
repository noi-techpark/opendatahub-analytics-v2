<template>
  <main class="main">
    <div class="map-ct">
      <div id="map" />
    </div>
  </main>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onMounted } from 'vue'

onMounted(() => {
  const map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '<a target="_blank" href="http://www.opendatahub.com">OpenDataHub.com</a> | Map tiles by <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a>',
        },
      },
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    },
    center: [11.3295, 46.4896],
    zoom: 13,
  })
})
</script>

<style lang="postcss" scoped>
.main {
  & .map-ct {
    @apply absolute top-0 left-0 w-full h-screen;

    & #map {
      @apply w-full h-full;
    }
  }
}

@media (max-width: theme('screens.md')) {
}
</style>
