// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Layer } from './map-layer.js'

export type DataMarker = {
   alarm?: boolean
   selected?: boolean
   coordinates: [number, number]
} & Pick<Layer, 'color'> &
   Pick<DataPoint, 'stype' | 'scode'>

export type DataPoint = {
   sname: string
   scode: string
   scoordinate?: {
      x: number
      y: number
      srid: number
   }
   stype: string
}

export type MarkerInfo = {
   [key: string]: {
      stations: {
         [key: string]: {
            sname: string
         }
      }
   }
}

export type MarkerData = {}
