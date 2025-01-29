<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="time-series-card" :class="{ open }">
      <div class="card-header __clickable" @click="toggleOpen">
         <div class="title-ct">
            <P bold class="title">{{ displayName }}</P>
         </div>
         <Popover v-slot="{ open: popoverOpen }" class="relative">
            <PopoverButton
               ref="popoverButton"
               class="relative z-10 flex cursor-pointer items-center"
               :class="{
                  'bg-green-light outline-2 outline-green': popoverOpen,
               }"
            >
               <MoreVertIcon class="__clickable flex-shrink-0" />
            </PopoverButton>
            <PopoverTransition>
               <PopoverPanel class="popover-panel">
                  <RouterLink
                     :to="{
                        name: 'charts-edit',
                        query: {
                           id: timeSeries.id,
                        },
                     }"
                     class="action-icon"
                  >
                     {{ t('common.edit') }}<EditIcon class="icon edit" />
                  </RouterLink>
                  <div
                     class="action-icon"
                     @click.stop="onDuplicateTimeSeries()"
                  >
                     {{ t('common.duplicate')
                     }}<ContentCopyIcon class="icon copy" />
                  </div>
                  <div
                     class="action-icon"
                     @click.stop="onOpenDeleteDialog(timeSeries.id)"
                  >
                     {{ t('common.delete') }}<DeleteIcon class="icon delete" />
                  </div> </PopoverPanel></PopoverTransition
         ></Popover>
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
            <MoreVertIcon class="__clickable opacity-0" />
         </div>
      </div>

      <DialogCustom :is-open="deleteDialog.open" @close="onCloseDeleteDialog()">
         <template #title>{{ t('views.charts.delete-dialog.title') }}</template>
         <template #body>
            <p class="text-center">
               {{ t('views.charts.delete-dialog.content') }}
            </p>
            <div class="mt-5 grid grid-cols-2 gap-3">
               <Button
                  secondary
                  center
                  :value="t('common.cancel')"
                  @click="onCloseDeleteDialog()"
               ></Button>
               <Button
                  center
                  :value="t('common.confirm')"
                  @click="onDeleteTimeSeries()"
               ></Button>
            </div>
         </template>
      </DialogCustom>
   </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs } from 'vue'
import { TimeSeries } from '../../../types/time-series'
import P from '../tags/P.vue'
import MoreVertIcon from '../svg/MoreVertIcon.vue'
import ArrowDownIcon from '../svg/ArrowDownIcon.vue'
import { useI18n } from 'vue-i18n'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import PopoverTransition from '../popover/PopoverTransition.vue'
import EditIcon from '../svg/EditIcon.vue'
import DeleteIcon from '../svg/DeleteIcon.vue'
import DialogCustom from '../dialog/DialogCustom.vue'
import Button from '../Button.vue'
import { useTimeSeriesStore } from '../../../stores/time-series'
import ContentCopyIcon from '../svg/ContentCopyIcon.vue'

type Props = {
   timeSeries: TimeSeries
}

const props = withDefaults(defineProps<Props>(), {})

const { addTimeSeries, deleteTimeSeries, getBaseTimeSeriesObj } =
   useTimeSeriesStore()

const { t } = useI18n()

const popoverButton = ref()

const deleteDialog = ref({
   id: '',
   open: false,
})

const open = ref<boolean>(false)
const cardContent = ref<HTMLElement>()
const contentHeightPx = ref<string>('0px')

const { timeSeries } = toRefs(props)

const cardContentItems = computed(() => [
   {
      title: t('components.time-series-card.provider'),
      value: timeSeries.value.provider,
      action: () => null,
   },
   {
      title: t('components.time-series-card.dataset'),
      value: timeSeries.value.dataset,
      action: () => null,
   },
   {
      title: t('components.time-series-card.station'),
      value: timeSeries.value.station,
      action: () => null,
   },
   {
      title: t('components.time-series-card.datatype'),
      value: timeSeries.value.datatype,
      action: () => null,
   },
   {
      title: t('components.time-series-card.period'),
      value: timeSeries.value.period,
      action: () => null,
   },
])

const displayName = computed(() => {
   return Object.entries(timeSeries.value)
      .filter(([key]) =>
         ['provider', 'dataset', 'station', 'datatype', 'period'].includes(key)
      )
      .map(([_, value]) => value)
      .join(', ')
})

const toggleOpen = () => {
   open.value = !open.value
}

const onDuplicateTimeSeries = () => {
   const { id, color } = getBaseTimeSeriesObj()
   addTimeSeries({ ...timeSeries.value, id, data: [], labels: [], color })
   popoverButton.value.$el.click()
}

const onDeleteTimeSeries = () => {
   deleteTimeSeries(deleteDialog.value.id)
   deleteDialog.value.open = false
}

const onCloseDeleteDialog = () => {
   deleteDialog.value.open = false
}

const onOpenDeleteDialog = (id: string) => {
   deleteDialog.value.id = id
   deleteDialog.value.open = true
}

onMounted(() => {
   if (cardContent.value) {
      contentHeightPx.value = `${cardContent.value.offsetHeight}px`
   }
})
</script>

<style lang="postcss" scoped>
.time-series-card {
   @apply relative select-none pb-0 transition-all;

   &.open {
      padding-bottom: v-bind('contentHeightPx');

      & .card-header {
         @apply mb-[-1px] rounded-b-none bg-grey;

         & .arrow-icon {
            @apply -rotate-180;
         }
      }

      & .card-content-ct {
         @apply pointer-events-auto top-auto opacity-100;
      }
   }

   & .card-header {
      @apply relative flex gap-2 rounded border bg-white p-2;

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

      & .popover-panel {
         @apply absolute left-auto right-0 z-20 mt-2 w-fit rounded border bg-white text-xs;

         & .action-icon {
            @apply relative flex cursor-pointer items-center justify-between gap-0.5 border-b px-4 py-2;

            &:hover {
               @apply bg-green-light;
            }

            & .icon {
               @apply h-3;

               &.delete {
                  @apply stroke-current text-red-500;
               }
            }
         }
      }
   }

   & .card-content-ct {
      @apply pointer-events-none absolute top-0 w-full opacity-0 transition-transform;

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
