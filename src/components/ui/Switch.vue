<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="switch-ct">
      <Switch
         v-model="model"
         :disabled="disabled"
         class="switch-custom relative inline-flex h-5 w-9 items-center rounded-full bg-grey-2 p-[2px]"
         :class="{ '!bg-green': model, 'opacity-80': disabled }"
      >
         <span
            aria-hidden="true"
            class="pointer-events-none size-4 translate-x-0 rounded-full bg-white transition-all"
            :class="{ 'translate-x-[100%]': model }"
         />
      </Switch>
      <div class="__clickable" @click="model = !model">
         <slot />
      </div>
   </div>
</template>

<script lang="ts" setup>
import { Switch } from '@headlessui/vue'

type Props = {
   disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const model = defineModel<boolean>()
</script>

<style lang="postcss" scoped>
.switch-ct {
   @apply inline-flex select-none items-center gap-2;
}
</style>
