// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useNavigatorLanguage } from '@vueuse/core'

const { language } = useNavigatorLanguage()

const getReadableDateWithTime = (date: Date) => {
   return date.toLocaleString(language.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
   })
}

export { getReadableDateWithTime }
