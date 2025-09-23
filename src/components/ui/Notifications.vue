<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="notifications-wrapper">
      <transition-group name="notif-fade" tag="div">
         <div
            v-for="(notification, index) in notifications"
            :key="notification.id"
            class="notification"
            :class="notification.type"
            :style="{ top: `${index * 10}px` }"
            role="alert"
         >
            <InfoIcon
               :class="{
                  icon: true,
                  'stroke-red-500': notification.type === 'error',
                  'stroke-blue-500': notification.type === 'info',
               }"
            />

            <span class="message">{{ notification.message }}</span>
            <CloseIcon
               class="__clickable"
               @click="removeNotification(notification.id)"
            />
         </div>
      </transition-group>
   </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../../stores/notifications'
import CloseIcon from './svg/CloseIcon.vue'
import InfoIcon from './svg/InfoIcon.vue'

const store = useNotificationsStore()
const { notifications } = storeToRefs(store)
const { removeNotification } = store
</script>

<style lang="postcss" scoped>
.notifications-wrapper {
   @apply fixed right-6 top-6 z-50 flex flex-col gap-3;

   & .notification {
      @apply relative flex min-w-60 max-w-[340px] items-center gap-2 rounded-lg border-l-4 bg-white px-4 py-3 text-sm shadow-sm;

      &.error {
         @apply border-red-500;
      }
      &.info {
         @apply border-blue-500;
      }

      & .message {
         @apply flex-1 pr-3;
      }

      & .icon {
         @apply size-4;
      }
   }
}

@media (max-width: theme('screens.md')) {
   .notifications-wrapper {
      @apply right-3 top-3 left-3;
      
      & .notification {
         @apply min-w-0 max-w-full;
      }
   }
}

/* Animations */
.notif-fade-enter-active,
.notif-fade-leave-active {
   transition: all 0.25s;
}
.notif-fade-enter-from,
.notif-fade-leave-to {
   opacity: 0;
   transform: translateY(-10px);
}
@keyframes notif-in {
   from {
      opacity: 0;
      transform: translateY(-10px);
   }
   to {
      opacity: 1;
      transform: translateY(0);
   }
}
</style>
