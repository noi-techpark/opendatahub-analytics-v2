// SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface SelectOption<T = string | number | undefined> {
   label: string
   value: T
   disabled?: boolean
}
