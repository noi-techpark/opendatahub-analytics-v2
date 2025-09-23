// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parse } from 'yaml'
import { AlarmConfig } from '../types/alarm-config'
import alarmsConfigUrl from '../assets/config/alarms.yaml?url'

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
      // Basic guard: if the response is HTML (e.g., index.html due to misrouted path),
      // parsing as YAML will throw a confusing error. Detect and throw clearer message.
      if (/^\s*<!|^\s*<!--/i.test(yamlContent)) {
         throw new Error(
            'Unexpected HTML received when fetching alarms.yaml (check asset URL or server history fallback)'
         )
      }
      return parseAlarmConfig(yamlContent)
   } catch (error) {
      console.error('Error loading alarm configuration:', error)
      return {}
   }
}

export function getDefaultAlarmConfigUrl(): string {
   return alarmsConfigUrl
}
