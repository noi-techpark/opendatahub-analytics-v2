// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { randomId } from '../components/utils/useRandomId'

export type NotificationType = 'error' | 'info'

export interface Notification {
   id: string
   type: NotificationType
   message: string
   duration?: number // ms, optional
}

export const useNotificationsStore = defineStore('notifications', () => {
   const notifications = ref<Notification[]>([])

   const showNotification = (notification: Omit<Notification, 'id'>) => {
      const _notification: Notification = {
         id: randomId(),
         duration: 5000,
         ...notification,
      }
      notifications.value.unshift(_notification)
      if (_notification.duration && _notification.duration > 0) {
         setTimeout(() => {
            removeNotification(_notification.id)
         }, _notification.duration)
      }
      return _notification.id
   }

   const removeNotification = (id: string) => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
   }
   const clearNotifications = () => {
      notifications.value = []
   }

   return {
      notifications,
      showNotification,
      removeNotification,
      clearNotifications,
   }
})
