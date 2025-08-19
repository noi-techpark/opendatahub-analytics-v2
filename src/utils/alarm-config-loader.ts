// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parse } from 'yaml'
import { AlarmConfig } from '../types/alarm-config'

export function parseAlarmConfig(yamlContent: string): AlarmConfig {
   try {
      const config = parse(yamlContent) as AlarmConfig
      return config
   } catch (error) {
      console.error('Error parsing alarm configuration:', error)
      return {}
   }
}

export async function loadAlarmConfig(configUrl: string): Promise<AlarmConfig> {
   try {
      const response = await fetch(configUrl)
      if (!response.ok) {
         throw new Error(
            `Failed to load alarm configuration: ${response.status} ${response.statusText}`
         )
      }
      const yamlContent = await response.text()
      return parseAlarmConfig(yamlContent)
   } catch (error) {
      console.error('Error loading alarm configuration:', error)
      return {}
   }
}

export function getDefaultAlarmConfigUrl(): string {
   return '/src/assets/config/alarms.yaml'
}
