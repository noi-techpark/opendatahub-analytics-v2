// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

export type TimeSeries = {
   id: string
   provider: string
   dataset: string
   station: string
   datatype: string
   period: string
   color: string
   data: number[]
}
