<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div
      class="focus-within:border-green-500 focus-within:bg-green-500/10 flex h-9 items-center justify-between gap-2 rounded border border-gray-400 bg-white p-2 py-5 text-black md:p-2"
   >
      <slot v-if="showIcon" name="icon"></slot>

      <input
         :id="id"
         ref="inputRef"
         v-model="text"
         class="grow border-none bg-transparent p-0 px-3 focus:ring-0"
         :placeholder="labelPlaceholder"
         :disabled="disabled"
         :data-test="`${id}-input`"
         @keypress.enter="emitConfirmedValue"
      />
      <div class="flex items-center gap-2">
         <button
            class="text-green-500 p-[3px] opacity-0"
            :class="{ 'opacity-100': hasText }"
            :data-test="`${id}-reset-search`"
            :disabled="!hasText || disabled"
            @click="deleteText"
         >
            <IconClose class="size-4" />
         </button>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useSlots, watch } from 'vue'
import { randomId } from '../../utils/useRandomId'
import IconClose from '../svg/IconClose.vue'

const emit = defineEmits(['confirmedValue', 'update:modelValue'])

const props = withDefaults(
   defineProps<{
      modelValue?: string
      disabled?: boolean
      focus?: boolean
      id?: string
      labelButton?: string
      labelPlaceholder?: string
      showButtonOnLeft?: boolean
      showIcon?: boolean
      showButtonTextMobile?: boolean
   }>(),
   {
      modelValue: undefined,
      disabled: undefined,
      focus: undefined,
      id: randomId(),
      labelButton: undefined,
      labelPlaceholder: undefined,
      showButtonOnLeft: false,
   }
)

const text = ref(props.modelValue)

watch(
   () => props.modelValue,
   (value) => (text.value = value)
)

watch(
   () => text.value,
   (value) => emit('update:modelValue', value)
)

const inputRef = ref()
const focusInput = () =>
   setTimeout(() => {
      if (inputRef.value != null) {
         inputRef.value.focus()
      }
   }, 500)

onMounted(() => {
   if (props.focus === true) {
      focusInput()
   }
})

const hasText = computed(() => text.value?.length ?? 0 > 0)

const deleteText = () => {
   text.value = ''
   emitConfirmedValue()
   focusInput()
}

const emitConfirmedValue = () => emit('confirmedValue', text.value)

const slots = useSlots()
const showConfirmButton = computed(
   () => props.labelButton != null || slots['icon'] != null
)
</script>
