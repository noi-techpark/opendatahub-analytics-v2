<!--TODO: temporary component-->

<template>
   <button
      class="button __clickable"
      :class="{
         primary,
         secondary,
         disabled,
         center,
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
}

const props = withDefaults(defineProps<Props>(), {
   primary: true,
})
</script>

<style lang="postcss" scoped>
.button {
   @apply relative flex h-8 w-full select-none items-center justify-start rounded;

   &.center {
      @apply justify-center;
   }

   min-width: 50px;
   line-height: 42px;

   & .svg-ct {
      @apply mr-2 inline-block h-full align-top;

      & .inner {
         @apply flex h-full items-center;

         & > svg {
            width: 18px;
            height: 18px;
            fill: theme(colors.white);
         }
      }
   }

   & > .loader-ct {
      border-radius: inherit;
      background-color: inherit;
   }

   &.primary {
      @apply bg-green text-white;
   }

   &.secondary {
      @apply border bg-grey text-black-2;
   }

   &.disabled {
      @apply pointer-events-none opacity-50;
   }
}
</style>
