// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface AlarmThreshold {
  min: number
  max: number
}

export interface Alarm {
  name: string
  description: string
  priority: 'high' | 'medium' | 'low'
  thresholds: AlarmThreshold
}

export interface MeasurementAlarms {
  alarms: Alarm[]
}

export interface StationTypeAlarms {
  [measurement: string]: MeasurementAlarms
}

export interface AlarmConfig {
  [stationType: string]: StationTypeAlarms
}

export interface AlarmEvent {
  timestamp: Date
  value: number
  stationName: string
  coordinates: [number, number]
  alarm: Alarm
  stationType: string
  measurement: string
}
