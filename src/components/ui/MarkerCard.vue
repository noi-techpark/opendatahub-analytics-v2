<template>
  <div class="marker-card-component">
    <div class="marker-card-header">
      <div class="marker-title-ct">
        <div class="marker-title-indicator" />
        <H class="marker-title" tag="h2">Bolzano 4 - Via C.Augusta</H>
      </div>
      <CloseIcon class="__clickable" @click="$emit('close')" />
    </div>
    <div class="marker-card-content">todo</div>
  </div>
</template>

<script lang="ts" setup>
import CloseIcon from './svg/CloseIcon.vue'
import H from './tags/H.vue'

type Props = {
  scode: string
}
const props = withDefaults(defineProps<Props>(), {})
</script>

<style lang="postcss" scoped>
.marker-card-component {
  @apply bg-white min-w-[300px] rounded-small overflow-hidden;

  & .marker-card-header {
    @apply flex justify-between items-center p-4 border border-stroke rounded-t-small;

    & .marker-title-ct {
      @apply flex gap-2;

      & .marker-title-indicator {
        @apply h-[30px] w-[2px] bg-yellow;
        content: '';
      }
    }
  }

  & .marker-card-content {
    @apply p-4 border border-stroke border-t-0 rounded-b-small;
  }
}

@media only screen and (max-width: theme('screens.md')) {
  .marker-card-component {
  }
}
</style>
