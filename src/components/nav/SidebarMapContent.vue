<template>
  <div class="sidebar-map-content">
    <ul class="layer-list" v-for="(item, i) in layerStore.getAllLayers">
      <div class="group-header">
        <p class="layer-title">{{ item.id }}</p>
        <p
          v-if="layerStore.isAnyInGroupSelected(i)"
          class="deselect-group __clickable"
          @click="layerStore.deselectAllInGroup(i)"
        >
          {{ $t('components.sidebar-map-content.deselect-group') }}
        </p>
      </div>
      <li v-for="(layer, j) in item.layers">
        <label
          class="layer-item __clickable"
          :class="{ selected: layerStore.isLayerSelected(i, j) }"
        >
          <div
            class="layer-color"
            :style="{
              'background-color': layer.color,
            }"
          />
          <input
            class="hidden"
            :name="`checkbox-${j}`"
            type="checkbox"
            :checked="layerStore.isLayerSelected(i, j)"
            @change="layerStore.toggleLayer(i, j)"
          />
          {{ layer.id }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { useLayerStore } from '../../stores/map-layers.js'

const layerStore = useLayerStore()
</script>

<style lang="postcss" scoped>
.sidebar-map-content {
  @apply flex flex-col gap-5;

  & .layer-list {
    @apply flex flex-col gap-1 select-none;

    & .group-header {
      @apply flex justify-between items-center;

      & .layer-title {
        @apply font-title text-lg font-semibold;
      }

      & .deselect-group {
        @apply text-sm font-medium underline opacity-60  transition-opacity;

        &:hover {
          @apply opacity-100;
        }
      }
    }

    & .layer-item {
      @apply flex items-center gap-2 w-fit opacity-40 transition-all;

      & .layer-color {
        @apply scale-0 size-4 rounded-full transition-all;
      }

      &.selected {
        @apply opacity-100 font-medium;

        & .layer-color {
          @apply scale-100;
        }
      }
    }
  }
}
</style>
