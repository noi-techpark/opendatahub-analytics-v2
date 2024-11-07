<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="time-series-card" :class="{ open }">
      <div class="card-header __clickable" @click="toggleOpen">
         <div class="title-ct">
            <P bold class="title">{{ timeSeries.displayName }}</P>
         </div>

         <MoreVertIcon class="__clickable flex-shrink-0" />
         <ArrowDownIcon class="__clickable arrow-icon flex-shrink-0" />
      </div>

      <div ref="cardContent" class="card-content-ct">
         <div
            v-for="(item, i) in cardContentItems"
            class="card-content"
            :class="{ last: i === cardContentItems.length - 1, first: i === 0 }"
         >
            <div class="card-text">
               <P label bold>{{ item.title }}</P>
               <P label>{{ item.value }}</P>
            </div>
            <MoreVertIcon class="__clickable" />
         </div>
      </div>
   </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { TimeSeries } from '../../../types/time-series'
import P from '../tags/P.vue'
import MoreVertIcon from '../svg/MoreVertIcon.vue'
import ArrowDownIcon from '../svg/ArrowDownIcon.vue'
import { useI18n } from 'vue-i18n'

type Props = {
   timeSeries: TimeSeries
}

const props = withDefaults(defineProps<Props>(), {})

const { t } = useI18n()
const open = ref<boolean>(false)
const cardContent = ref<HTMLElement>()
const contentHeightPx = ref<string>('0px')

const toggleOpen = () => {
   open.value = !open.value
}

const cardContentItems = computed(() => [
   {
      title: t('components.time-series-card.dataset'),
      value: props.timeSeries.dataset,
      action: () => null,
   },
   {
      title: t('components.time-series-card.station'),
      value: props.timeSeries.station,
      action: () => null,
   },
   {
      title: t('components.time-series-card.datatype'),
      value: props.timeSeries.datatype,
      action: () => null,
   },
   {
      title: t('components.time-series-card.period'),
      value: props.timeSeries.period,
      action: () => null,
   },
])

onMounted(() => {
   if (cardContent.value) {
      contentHeightPx.value = `${cardContent.value.offsetHeight}px`
   }
})
</script>

<style lang="postcss" scoped>
.time-series-card {
   @apply relative select-none overflow-hidden pb-0 transition-all;

   &.open {
      padding-bottom: v-bind('contentHeightPx');

      & .card-header {
         @apply mb-[-1px] rounded-b-none bg-grey;

         & .arrow-icon {
            @apply -rotate-180;
         }
      }

      & .card-content-ct {
         @apply pointer-events-auto opacity-100;
      }
   }

   & .card-header {
      @apply relative z-10 flex gap-2 rounded border bg-white p-2;

      & .title-ct {
         @apply flex gap-2;

         &:before {
            @apply w-[2px] flex-shrink-0;
            content: '';
            /** @vue-ignore */
            background-color: v-bind('props.timeSeries.color');
         }

         & .title {
            @apply line-clamp-2;
         }
      }

      & .arrow-icon {
         @apply transition-all;
      }
   }

   & .card-content-ct {
      @apply pointer-events-none absolute bottom-0 z-0 w-full opacity-0 transition-all;

      & .card-content {
         @apply flex justify-between border border-b-0 bg-white p-2;

         &.first {
            @apply border-t-0;
         }

         &.last {
            @apply rounded-b border-b;
         }
      }
   }
}
</style>
