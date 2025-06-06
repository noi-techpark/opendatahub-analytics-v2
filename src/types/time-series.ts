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
   labels: string[]
}

export enum TimeEnum {
   DAY = 'DAY',
   WEEK = 'WEEK',
   MONTH = 'MONTH',
   SIX_MONTHS = '6_MONTHS',
   CUSTOM = 'CUSTOM',
}

export type TimeRange = [Date, Date]
