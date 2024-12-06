<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <Popover v-slot="{ open }" class="relative">
      <PopoverButtonCustom
         ref="popoverButtonCustom"
         :open="open"
         :disabled="disabled"
         :text="text"
         :selected="selected"
      />

      <PopoverTransition>
         <PopoverPanel
            class="absolute left-auto right-0 z-20 mt-2 w-fit rounded border bg-white"
         >
            <VueDatePicker
               ref="datePicker"
               v-model="date"
               range
               inline
               :locale="language"
               :enable-time-picker="false"
               :action-row="{
                  showSelect: false,
                  showCancel: false,
                  showNow: false,
                  showPreview: true,
               }"
               :ui="{
                  input: 'w-full border-0',
                  calendar: 'w-full border-0',
                  menu: 'w-full border-0',
               }"
               :class="{ 'selection-range': isSelectionRange }"
               @internal-model-change="handleInternal"
            ></VueDatePicker>

            <div class="flex justify-between gap-2 border-t p-2">
               <Button grow center outline @click="onCancel">{{
                  $t('common.cancel')
               }}</Button>
               <Button grow center @click="onSave">{{
                  $t('common.save')
               }}</Button>
            </div>
         </PopoverPanel>
      </PopoverTransition>
   </Popover>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Popover, PopoverPanel } from '@headlessui/vue'
import PopoverButtonCustom from '../popover/PopoverButtonCustom.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Button from '../Button.vue'
import { useI18n } from 'vue-i18n'
import { addDays, isEqual, set } from 'date-fns'
import { useNavigatorLanguage } from '@vueuse/core'
import PopoverTransition from '../popover/PopoverTransition.vue'

const { t } = useI18n()

type Props = {
   text: string
   loading?: boolean
   disabled?: boolean
   selected?: boolean
   showSearch?: boolean
}

const { language } = useNavigatorLanguage()

const props = defineProps<Props>()

const emit = defineEmits(['save', 'cancel', 'search'])

const isSelectionRange = ref(false)
const popoverButtonCustom = ref()
const datePicker = ref()
const date = defineModel<Date[]>()

const handleInternal = (internalDate: Date[]) => {
   isSelectionRange.value =
      internalDate.length > 1 && !isEqual(internalDate[0], internalDate[1])
}

const onSave = () => {
   emit('save')

   datePicker.value.selectDate()
   popoverButtonCustom.value.clickPopover()
}

const onCancel = () => {
   emit('cancel')

   popoverButtonCustom.value.clickPopover()
}

onMounted(() => {
   isSelectionRange.value = !isEqual(date.value[0], date.value[1])
})
</script>

<style>
.dp__theme_light {
   border: 0;

   --dp-range-between-dates-background-color: rgba(80, 116, 47, 0.2);
   --dp-range-between-dates-text-color: #000;
   --dp-range-between-border-color: transparent;
}

.dp__range_end,
.dp__range_start,
.dp__active_date {
   @apply relative rounded-full border-green/20 bg-green text-white;
}

.selection-range {
   & .dp__range_end,
   & .dp__range_start {
      &::after {
         @apply absolute -top-px h-[35px] w-1/2 bg-green/20;

         content: ' ';
      }
   }

   & .dp__range_end {
      &::after {
         @apply -left-px;
      }
   }

   & .dp__range_start {
      &::after {
         @apply -right-px;
      }
   }
}

.dp__selection_preview {
   @apply w-full text-center text-base;
}

.dp__today {
   @apply rounded-full;
}

.dp__range_between {
   @apply !rounded-none !border-0;
}
</style>
