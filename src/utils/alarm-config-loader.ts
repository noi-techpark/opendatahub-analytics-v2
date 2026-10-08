// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parse } from 'yaml'
import { AlarmConfig } from '../types/alarm-config'
import alarmsConfigUrl from '../assets/config/alarms.yaml?url'

export type AlarmConfigErrorReason = 'fetch' | 'format' | 'parse'

/**
 * Raised instead of silently returning an empty configuration: an unreadable
 * alarms.yaml disables every alarm, so callers must be able to tell the user.
 *
 * `detail` keeps only the first line of the cause: YAML errors carry the
 * offending snippet on the following lines, which would not fit a notification.
 */
export class AlarmConfigError extends Error {
   readonly detail: string

   constructor(
      readonly reason: AlarmConfigErrorReason,
      cause: unknown
   ) {
      const detail =
         String(
            cause instanceof Error ? cause.message : (cause ?? 'unknown error')
         )
            .split('\n')[0]
            .trim() || 'unknown error'
      super(`Alarm configuration ${reason} failed: ${detail}`)
      this.name = 'AlarmConfigError'
      this.detail = detail
   }
}

export function parseAlarmConfig(yamlContent: string): AlarmConfig {
   try {
      const config = parse(yamlContent) as AlarmConfig
      return config
   } catch (error) {
      throw new AlarmConfigError('parse', error)
   }
}

export async function loadAlarmConfig(configUrl: string): Promise<AlarmConfig> {
   let response: Response
   try {
      response = await fetch(configUrl)
   } catch (error) {
      throw new AlarmConfigError('fetch', error)
   }
   if (!response.ok) {
      throw new AlarmConfigError(
         'fetch',
         `${response.status} ${response.statusText}`
      )
   }
   const yamlContent = await response.text()
   // Basic guard: if the response is HTML (e.g., index.html due to misrouted path),
   // parsing as YAML will throw a confusing error. Detect and report a clearer message.
   if (/^\s*<!|^\s*<!--/i.test(yamlContent)) {
      throw new AlarmConfigError(
         'format',
         'Unexpected HTML received when fetching alarms.yaml (check asset URL or server history fallback)'
      )
   }
   return parseAlarmConfig(yamlContent)
}

export function getDefaultAlarmConfigUrl(): string {
   return alarmsConfigUrl
}
