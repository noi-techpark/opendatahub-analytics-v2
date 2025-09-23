// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AlarmConfig, AlarmEvent } from '../types/alarm-config'

export interface StationMeasurement {
   stationType: string
   measurement: string
   value: number
   timestamp: Date
   stationName: string
   coordinates: [number, number]
}

export function evaluateAlarms(
   measurement: StationMeasurement,
   alarmConfig: AlarmConfig
): AlarmEvent[] {
   const { stationType, measurement: measurementType, value } = measurement

   const stationAlarms = alarmConfig[stationType]
   if (!stationAlarms) {
      return []
   }

   const measurementAlarms = stationAlarms[measurementType]
   if (!measurementAlarms || !measurementAlarms.alarms) {
      return []
   }

   const triggeredAlarms: AlarmEvent[] = []

   for (const alarm of measurementAlarms.alarms) {
      if (value >= alarm.thresholds.min && value <= alarm.thresholds.max) {
         triggeredAlarms.push({
            timestamp: measurement.timestamp,
            value: measurement.value,
            stationName: measurement.stationName,
            coordinates: measurement.coordinates,
            alarm,
            stationType,
            measurement: measurementType,
         })
      }
   }

   return triggeredAlarms
}

export function getAllActiveAlarms(
   measurements: StationMeasurement[],
   alarmConfig: AlarmConfig
): AlarmEvent[] {
   return measurements.flatMap((measurement) =>
      evaluateAlarms(measurement, alarmConfig)
   )
}

export function filterAlarmsByPriority(
   alarms: AlarmEvent[],
   priority: 'high' | 'medium' | 'low'
): AlarmEvent[] {
   return alarms.filter((alarm) => alarm.alarm.priority === priority)
}

export function filterAlarmsByStationType(
   alarms: AlarmEvent[],
   stationType: string
): AlarmEvent[] {
   return alarms.filter((alarm) => alarm.stationType === stationType)
}

export function filterAlarmsByMeasurement(
   alarms: AlarmEvent[],
   measurement: string
): AlarmEvent[] {
   return alarms.filter((alarm) => alarm.measurement === measurement)
}
