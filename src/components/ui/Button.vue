<!--
SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!--TODO: temporary component-->

<template>
   <button
      class="button __clickable"
      :class="{
         primary,
         secondary,
         disabled,
         center,
         outline,
         grow,
         small,
      }"
   >
      <IconText bold :text="value" :hover="false">
         <slot />
      </IconText>
   </button>
</template>

<script lang="ts" setup>
import IconText from './IconText.vue'

type Props = {
   value?: string
   primary?: boolean
   secondary?: boolean
   disabled?: boolean
   center?: boolean
   outline?: boolean
   grow?: boolean
   small?: boolean
}

const props = withDefaults(defineProps<Props>(), {
   primary: true,
   small: false,
})
</script>

<style lang="postcss" scoped>
.button {
   @apply relative flex h-8 select-none items-center justify-start rounded border font-semibold;

   &.center {
      @apply justify-center;
   }

   &.grow {
      @apply w-full;
   }

   min-width: 50px;
   line-height: 42px;

   &.small {
      @apply h-6 leading-tight;
      line-height: 1.5rem;
   }

   & .svg-ct {
      @apply mr-2 inline-block h-full align-top;

      & .inner {
         @apply flex h-full items-center;

         & > svg {
            width: 18px;
            height: 18px;
            fill: theme('colors.white');
         }
      }
   }

   & > .loader-ct {
      border-radius: inherit;
      background-color: inherit;
   }

   &.primary {
      @apply border border-green bg-green text-white;

      &.outline {
         @apply border-0 bg-white text-green outline-1;
      }
   }

   &.secondary {
      @apply border bg-grey text-black-2;
   }

   &.disabled {
      @apply pointer-events-none opacity-50;
   }
}
</style>
