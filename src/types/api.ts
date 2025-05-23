// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Layer } from './map-layer.js'

export type StationMapMarker = {
   scode: string
   color: string
   stype: string
   coordinates: [number, number]
   selected?: boolean
   infoColor?: string
   eventData?: string // stringified EventPoint (JSON)
}

export type DataMarker = {
   alarm?: boolean
   sname?: string
   selected?: boolean
   coordinates: [number, number]
   infoColor?: string
   eventData?: EventPoint
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
   sorigin: string
}

export type EventPoint = {
   evcategory: string
   evdescription: string
   evend: string
   evmetadata: {
      placeDe?: string
      placeIt?: string
      tycodeDe?: string
      tycodeIt?: string
      messageId?: number
      actualMail?: number
      subTycodeDe?: string
      subTycodeIt?: string
      tycodeValue?: string
      messageGradId?: number
      messageStatus?: number
      messageZoneId?: number
      subTycodeValue?: string
      messageStreetId?: number
      messageStreetNr?: string
      publishDateTime?: string
      json_featuretype?: string
      messageGradDescDe?: string
      messageGradDescIt?: string
      messageZoneDescDe?: string
      messageZoneDescIt?: string
      messageStreetWapDescDe?: string
      messageStreetWapDescIt?: string
      messageStreetHierarchie?: number
      messageStreetInternetDescDe?: string
      messageStreetInternetDescIt?: string
      [key: string]: any
   }
   evname: string
   evorigin: string
   evseriesuuid: string
   evstart: string
   evtransactiontime: string
   evuuid: string
   evldescription: string
   evlgeometry: {
      crs: {
         type: string
         properties: {
            name: string
         }
      }
      bbox: number[]
      type: string
      coordinates: [number, number]
   }
   prlineage: string
   prname: string
   prversion: string
}

export type MarkerInfo = {
   sactive: boolean
   savailable: boolean
   scode: string
   sname: string
   scoordinate: {
      c: number
      y: number
   }
   smetadata:
      | {
           [key: string]: any
        }
      | {}
}

export type MarkerMeasurements = {
   mperiod: number
   tname: string
   tunit: string
   mvalue: number
   sorigin: string
   stype: string
   sname: string
   _timestamp: string
}
