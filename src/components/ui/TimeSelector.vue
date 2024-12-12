<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="time-selector">
      <MenuButtons :links :selected-id="model" />
      <RangeDatePicker
         :text="$t('components.time-selector.custom')"
         v-model="range"
         :selected="model === TimeEnum.CUSTOM"
         @save="onSaveRangeCustom()"
      />
   </div>
</template>

<script lang="ts" setup>
import { computed, useModel } from 'vue'
import { TimeEnum } from '../../types/time-series'
import MenuButtons from './MenuButtons.vue'
import Select from './Select.vue'
import { useI18n } from 'vue-i18n'
import RangeDatePicker from './input/RangeDatePicker.vue'

const { t } = useI18n()
const model = defineModel<TimeEnum>({ default: TimeEnum.DAY })
const range = defineModel<[Date, Date]>('range', {
   default: [new Date(), new Date()],
})

const onSaveRangeCustom = () => {
   model.value = TimeEnum.CUSTOM
}

const links = computed(() => [
   {
      id: TimeEnum.DAY,
      title: t('components.time-selector.day'),
      action: () => (model.value = TimeEnum.DAY),
   },
   {
      id: TimeEnum.WEEK,
      title: t('components.time-selector.week'),
      action: () => (model.value = TimeEnum.WEEK),
   },
   {
      id: TimeEnum.MONTH,
      title: t('components.time-selector.month'),
      action: () => (model.value = TimeEnum.MONTH),
   },
   {
      id: TimeEnum.SIX_MONTHS,
      title: t('components.time-selector.6-months'),
      action: () => (model.value = TimeEnum.SIX_MONTHS),
   },
])
</script>

<style lang="postcss" scoped>
.time-selector {
   @apply flex gap-3;
}
</style>
