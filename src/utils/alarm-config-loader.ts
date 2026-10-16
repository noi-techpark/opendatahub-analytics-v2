// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parseDocument } from 'yaml'
import type { Document } from 'yaml'
import { AlarmConfig } from '../types/alarm-config'
import alarmsConfigUrl from '../assets/config/alarms.yaml?url'

export type AlarmConfigErrorReason = 'fetch' | 'format' | 'parse' | 'schema'

export type AlarmProblemSeverity = 'error' | 'warning'

/**
 * One thing wrong with alarms.yaml, ready to be listed in the UI.
 *
 * `message` is the parser's own text (English, untranslated): rephrasing it
 * would hide the detail that makes the mistake findable. `lines` points at the
 * offending source lines so the operator can jump straight into the file.
 */
export interface AlarmConfigProblem {
   severity: AlarmProblemSeverity
   message: string
   /** 1-based source lines; empty when the problem has no position. */
   lines: number[]
   /** 1-based column of the first occurrence, when the parser reported one. */
   column?: number
}

export interface AlarmConfigResult {
   config: AlarmConfig
   /** Non-fatal problems: the configuration was applied anyway. */
   problems: AlarmConfigProblem[]
}

/**
 * A single indentation mistake makes the parser report one error per line of
 * the block, so identical messages are grouped; the cap keeps the dialog
 * scrollable when the whole file is broken.
 */
const MAX_PROBLEMS = 15

const PRIORITIES = ['high', 'medium', 'low']

const POSITION_SUFFIX = / at line (\d+), column (\d+):?$/

/**
 * Raised instead of silently returning an empty configuration: an unreadable
 * alarms.yaml disables every alarm, so the UI has to say exactly what is wrong.
 */
export class AlarmConfigError extends Error {
   readonly problems: AlarmConfigProblem[]

   constructor(
      readonly reason: AlarmConfigErrorReason,
      problems: AlarmConfigProblem[]
   ) {
      const list = problems.length
         ? problems
         : [{ severity: 'error' as const, message: 'unknown error', lines: [] }]
      super(`Alarm configuration ${reason} failed: ${list[0].message}`)
      this.name = 'AlarmConfigError'
      this.problems = list.slice(0, MAX_PROBLEMS)
   }
}

function toProblem(
   severity: AlarmProblemSeverity,
   cause: unknown
): AlarmConfigProblem {
   const error = cause as {
      message?: string
      linePos?: Array<{ line: number; col: number }>
   }
   const firstLine = String(error?.message ?? cause ?? 'unknown error')
      .split('\n')[0]
      .trim()
   const position = POSITION_SUFFIX.exec(firstLine)
   return {
      severity,
      message:
         (position ? firstLine.slice(0, position.index) : firstLine).trim() ||
         'unknown error',
      lines: error?.linePos?.length ? [error.linePos[0].line] : [],
      column: error?.linePos?.[0]?.col,
   }
}

/** Merge the per-line cascade a single mistake produces into one row. */
function groupProblems(problems: AlarmConfigProblem[]): AlarmConfigProblem[] {
   const grouped = new Map<string, AlarmConfigProblem>()
   for (const problem of problems) {
      const key = `${problem.severity}\u0000${problem.message}\u0000${problem.column ?? ''}`
      const existing = grouped.get(key)
      if (existing) existing.lines.push(...problem.lines)
      else grouped.set(key, { ...problem, lines: [...problem.lines] })
   }
   return [...grouped.values()]
}

function lineStarts(source: string): number[] {
   const starts = [0]
   for (
      let i = source.indexOf('\n');
      i !== -1;
      i = source.indexOf('\n', i + 1)
   ) {
      starts.push(i + 1)
   }
   return starts
}

function lineAt(starts: number[], offset: number): number {
   let low = 0
   let high = starts.length - 1
   while (low < high) {
      const mid = (low + high + 1) >> 1
      if (starts[mid] <= offset) low = mid
      else high = mid - 1
   }
   return low + 1
}

/** Source line of a node, so a semantic problem locates like a syntax one. */
function nodeLines(
   doc: Document,
   starts: number[],
   path: Array<string | number>
): number[] {
   const node = doc.getIn(path, true) as unknown as
      | { range?: number[] }
      | undefined
   const offset = node?.range?.[0]
   return offset === undefined ? [] : [lineAt(starts, offset)]
}

function pathText(path: Array<string | number>): string {
   let text = ''
   for (const part of path) {
      text +=
         typeof part === 'number' ? `[${part}]` : `${text ? ' > ' : ''}${part}`
   }
   return text
}

function isPlainObject(value: unknown): boolean {
   return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Structural checks the parser cannot do: a syntactically valid file can still
 * hold alarms that can never trigger (unknown priority, inverted thresholds)
 * or whose thresholds the evaluator would silently ignore.
 */
function validateAlarmConfig(
   raw: unknown,
   doc: Document,
   starts: number[]
): AlarmConfigProblem[] {
   const errors: AlarmConfigProblem[] = []
   const warnings: AlarmConfigProblem[] = []
   const fail = (message: string, path: Array<string | number>) =>
      errors.push({
         severity: 'error',
         message,
         lines: nodeLines(doc, starts, path),
      })
   const warn = (message: string, path: Array<string | number>) =>
      warnings.push({
         severity: 'warning',
         message,
         lines: nodeLines(doc, starts, path),
      })

   if (!isPlainObject(raw)) {
      fail('The configuration must be a mapping of station types', [])
      return errors
   }

   for (const [stationType, measurements] of Object.entries(
      raw as Record<string, unknown>
   )) {
      if (!isPlainObject(measurements)) {
         fail(`"${stationType}" must be a mapping of measurement types`, [
            stationType,
         ])
         continue
      }
      for (const [measurement, definition] of Object.entries(
         measurements as Record<string, unknown>
      )) {
         const base: Array<string | number> = [stationType, measurement]
         if (!isPlainObject(definition)) {
            fail(`"${pathText(base)}" must contain an "alarms" list`, base)
            continue
         }
         const alarms = (definition as Record<string, unknown>).alarms
         if (!Array.isArray(alarms) || alarms.length === 0) {
            fail(
               `"${pathText([...base, 'alarms'])}" must be a non-empty list of alarms`,
               [...base, 'alarms']
            )
            continue
         }
         alarms.forEach((alarm: unknown, index: number) => {
            const alarmPath = [...base, 'alarms', index]
            if (!isPlainObject(alarm)) {
               fail(
                  `"${pathText(alarmPath)}" must be an alarm definition`,
                  alarmPath
               )
               return
            }
            const entry = alarm as Record<string, unknown>
            const label = pathText(alarmPath)
            if (typeof entry.name !== 'string' || !entry.name.trim()) {
               fail(`"${label}" is missing a "name"`, alarmPath)
            }
            if (
               typeof entry.priority !== 'string' ||
               !PRIORITIES.includes(entry.priority)
            ) {
               fail(
                  `"${label}" has priority ${JSON.stringify(entry.priority)}; expected ${PRIORITIES.join(', ')}`,
                  [...alarmPath, 'priority']
               )
            }
            const thresholds = entry.thresholds
            if (
               !isPlainObject(thresholds) ||
               typeof (thresholds as Record<string, unknown>).min !==
                  'number' ||
               typeof (thresholds as Record<string, unknown>).max !== 'number'
            ) {
               fail(
                  `"${label}" needs numeric "min" and "max" under "thresholds"`,
                  [...alarmPath, 'thresholds']
               )
            } else {
               const { min, max } = thresholds as Record<string, number>
               if (min > max) {
                  fail(
                     `"${label}" has min ${min} greater than max ${max}: it can never trigger`,
                     [...alarmPath, 'thresholds']
                  )
               }
            }
            const periods = entry.periods
            if (periods !== undefined) {
               if (
                  !Array.isArray(periods) ||
                  periods.some(
                     (period: unknown) =>
                        typeof period !== 'number' ||
                        !isFinite(period) ||
                        period <= 0
                  )
               ) {
                  fail(
                     `"${label}" has invalid "periods": expected a list of positive durations in seconds`,
                     [...alarmPath, 'periods']
                  )
               } else if (periods.length === 0) {
                  warn(
                     `"${label}" declares no periods: it is evaluated against every period the station reports`,
                     [...alarmPath, 'periods']
                  )
               }
            }
            const origins = entry.origins
            if (
               origins !== undefined &&
               (!Array.isArray(origins) ||
                  origins.some(
                     (origin: unknown) =>
                        typeof origin !== 'string' || !origin.trim()
                  ))
            ) {
               fail(
                  `"${label}" has invalid "origins": expected a list of provider names`,
                  [...alarmPath, 'origins']
               )
            }
         })
      }
   }

   return [...errors, ...warnings]
}

export function parseAlarmConfig(yamlContent: string): AlarmConfigResult {
   const doc = parseDocument(yamlContent, { logLevel: 'silent' })
   const starts = lineStarts(yamlContent)
   const yamlProblems = groupProblems([
      ...doc.errors.map((error) => toProblem('error', error)),
      ...doc.warnings.map((warning) => toProblem('warning', warning)),
   ])
   if (doc.errors.length) {
      throw new AlarmConfigError('parse', yamlProblems)
   }

   let raw: unknown
   try {
      raw = doc.toJS()
   } catch (error) {
      throw new AlarmConfigError('parse', [
         ...yamlProblems,
         toProblem('error', error),
      ])
   }

   const problems = groupProblems([
      ...yamlProblems,
      ...validateAlarmConfig(raw, doc, starts),
   ])
   if (problems.some((problem) => problem.severity === 'error')) {
      throw new AlarmConfigError('schema', problems)
   }
   return { config: raw as AlarmConfig, problems }
}

export async function loadAlarmConfig(
   configUrl: string
): Promise<AlarmConfigResult> {
   let response: Response
   try {
      response = await fetch(configUrl)
   } catch (error) {
      throw new AlarmConfigError('fetch', [toProblem('error', error)])
   }
   if (!response.ok) {
      throw new AlarmConfigError('fetch', [
         {
            severity: 'error',
            message: `The configuration could not be downloaded (${response.status} ${response.statusText})`,
            lines: [],
         },
      ])
   }
   const yamlContent = await response.text()
   // Basic guard: if the response is HTML (e.g., index.html due to misrouted path),
   // parsing as YAML will throw a confusing error. Detect and report a clearer message.
   if (/^\s*<!|^\s*<!--/i.test(yamlContent)) {
      throw new AlarmConfigError('format', [
         {
            severity: 'error',
            message:
               'The configuration URL returned HTML instead of YAML (check the asset URL or the server history fallback)',
            lines: [],
         },
      ])
   }
   return parseAlarmConfig(yamlContent)
}

export function getDefaultAlarmConfigUrl(): string {
   return alarmsConfigUrl
}
