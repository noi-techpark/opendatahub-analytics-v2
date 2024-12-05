<template>
   <PopoverButton
      ref="popoverButton"
      :disabled="disabled"
      class="relative z-10 flex cursor-pointer items-center rounded border bg-grey"
      :class="{
         'cursor-not-allowed opacity-70': disabled,
         'bg-green-light': open,
      }"
   >
      <span
         class="max-w-[220px] select-none truncate border-r px-3 py-1 text-sm font-semibold"
         >{{ text }}</span
      >
      <ArrowDownIcon
         class="mx-1 transition-transform"
         :class="{ '-rotate-180': open }"
      />
   </PopoverButton>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ArrowDownIcon from '../svg/ArrowDownIcon.vue'
import { PopoverButton } from '@headlessui/vue'

type Props = {
   text: string
   open?: boolean
   disabled?: boolean
}

defineProps<Props>()

const popoverButton = ref()

const clickPopover = () => {
   popoverButton.value.$el.click()
}

defineExpose({ clickPopover })
</script>
