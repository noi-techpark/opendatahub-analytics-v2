// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { storeToRefs } from 'pinia'
import { useLayerDataStore } from '../stores/layer-data'
import {
   loadAlarmConfig,
   getDefaultAlarmConfigUrl,
} from '../utils/alarm-config-loader'
import type { AlarmConfig } from '../types/alarm-config'
import { useFetchWithAuth } from '../utils/api'
import type {
   AnnouncementEvent,
   DataMarker,
   DataPoint,
   EventPoint,
} from '../types/api'
import type { Layer, SelectedFilterOrigins } from '../types/map-layer'
import { differenceInHours } from 'date-fns'
import type { StationMeasurement } from '../utils/alarm-evaluator'
import { useNotificationsStore } from '../stores/notifications'

export function useLayerDataFetcher() {
   const layerData = useLayerDataStore()
   const { alarmConfig } = storeToRefs(layerData)
   const { showNotification } = useNotificationsStore()

   const ensureAlarmConfigLoaded = async () => {
      if (!alarmConfig.value || Object.keys(alarmConfig.value).length === 0) {
         try {
            const cfg = await loadAlarmConfig(getDefaultAlarmConfigUrl())
            layerData.setAlarmConfig(cfg)
         } catch (e) {
            console.error('Failed to load alarm configuration:', e)
         }
      }
   }

   // Centralized helper to build origin filters
   const buildOriginFilterString = (origins: string[]): string => {
      if (!origins || origins.length === 0) return ''
      const filterParts = origins.map((origin) => `sorigin.ire.${origin}`)
      const filterString = filterParts.join(',')
      return origins.length > 1 ? `or(${filterString})` : filterString
   }

   // Helper extracted from MapView: compute measurement types & periods from alarm config
   const getMeasurementTypesFromAlarmConfig = (
      stationType: string,
      cfg?: AlarmConfig
   ): Record<string, Record<string, boolean>> => {
      const result: Record<string, Record<string, boolean>> = {}
      const source = cfg || alarmConfig.value
      const stationAlarms = source?.[stationType]
      if (!stationAlarms) return result

      for (const measurementType in stationAlarms) {
         result[measurementType] = {}
         const measurementConfig = stationAlarms[measurementType]
         if (measurementConfig.alarms && measurementConfig.alarms.length > 0) {
            const uniquePeriods = new Set<string>()
            for (const alarm of measurementConfig.alarms) {
               if (alarm.periods && alarm.periods.length > 0) {
                  for (const period of alarm.periods) {
                     uniquePeriods.add(period.toString())
                  }
               }
            }
            if (uniquePeriods.size > 0) {
               for (const period of uniquePeriods) {
                  result[measurementType][period] = true
               }
            } else {
               if (
                  measurementType === 'temperature' ||
                  measurementType === 'air-temperature'
               ) {
                  result[measurementType]['600'] = true
                  result[measurementType]['86400'] = true
               } else if (measurementType === 'precipitation') {
                  result[measurementType]['600'] = true
                  result[measurementType]['86400'] = true
               } else {
                  result[measurementType]['600'] = true
               }
            }
         }
      }
      return result
   }

   // Province BZ event visibility rules (moved from MapView)
   const filterProvinceBZEvent = (event: EventPoint, date: Date) => {
      if (event.evorigin !== 'PROVINCE_BZ') return false
      const startTs = new Date(event.evstart).getTime()
      const endTs = new Date(event.evend).getTime()
      const category = event.evcategory
      const now = date.getTime()
      const startDayTs = new Date(event.evstart).setHours(0, 0, 0, 0)
      const todayTs = date.setHours(0, 0, 0, 0)
      switch (category) {
         case 'intralci viabilità in e fuori Alto Adige_chiusura temporanea | Verkehrsbehinderung für Zonen und aus. Südt._kurzfristige oder zeitweilige Sperre':
            if (endTs === null || endTs === undefined) return false
            return now <= startTs && now >= endTs
         case 'intralci viabilità in e fuori Alto Adige_cantiere | Verkehrsbehinderung für Zonen und aus. Südt._Baustelle':
            return now <= startTs && now >= endTs
         case 'intralci viabilità in e fuori Alto Adige_attenzione | Verkehrsbehinderung für Zonen und aus. Südt._Vorsicht':
         case 'intralci viabilità in e fuori Alto Adige_caduta frana | Verkehrsbehinderung für Zonen und aus. Südt._Murenabgang und Strassenverlegung':
         case 'intralci viabilità in e fuori Alto Adige_manifestazione | Verkehrsbehinderung für Zonen und aus. Südt._Veranstaltungen':
         case 'intralci viabilità in e fuori Alto Adige_senso unico alternato con semafero | Verkehrsbehinderung für Zonen und aus. Südt._Ampelregelung':
            return startDayTs !== todayTs
         default:
            if (category.includes('Situazione attuale'))
               return startDayTs !== todayTs
            return false
      }
   }

   const applyProvinceFilter = (markers: DataMarker[], date: Date) =>
      (markers || []).filter((mk) => {
         if (!mk.stype?.startsWith('PROVINCE_BZ')) return true
         const ev = (mk as any).eventData as EventPoint | undefined
         if (!ev) return true
         return !filterProvinceBZEvent(ev, date)
      })

   // URL updates are handled via useQueryInit().saveToUrl()

   // Fetch flat stations/events and compute markers for a layer
   const fetchStationData = async (
      layer: Layer,
      opts: {
         currentMarkers: DataMarker[]
         filter?: { stype: string; filterString: string }
         uniqueOrigins: Record<string, Set<string>>
         t: (key: string, params?: any) => string
         computeInfoColor?: (args: {
            stype: string
            dataType: string
            value: number
            diffHours: number
            period?: number
         }) => string | undefined
      }
   ): Promise<DataMarker[] | undefined> => {
      try {
         const isProvinceEvents = layer.id === 'Traffic Events'
         const now = new Date()

         const currentMarkers = opts.filter?.filterString
            ? [
                 ...opts.currentMarkers.filter(
                    (item) => item.stype !== opts.filter!.stype
                 ),
              ]
            : [...opts.currentMarkers]
         const newMarkers: DataMarker[] = []

         let flatData: EventPoint[] | DataPoint[] | AnnouncementEvent[] = []

         if (isProvinceEvents) {
            const baseUrl = import.meta.env.VITE_ODH_CONTENT_API_URI
            const pagesize = 200000
            const queryParams =
               `?pagesize=${pagesize}` +
               '&tagfilter=announcement%3Atraffic-event' +
               '&removenullvalues=false' +
               '&getasidarray=false'
            const url = `${baseUrl}/Announcement${queryParams}`

            const { data } = await useFetchWithAuth(url).json()
            const apiResponse = (data.value || {}) as {
               Items?: AnnouncementEvent[]
            }
            const items = apiResponse.Items || []

            const isActiveByTime = (item: AnnouncementEvent) => {
               if (!item.StartTime) return false
               const start = new Date(item.StartTime)
               const end = item.EndTime ? new Date(item.EndTime) : null
               return now >= start && (!end || now <= end)
            }

            flatData = items.filter(
               (item) => item.Active === true && isActiveByTime(item)
            )
         } else {
            let datasetType = 'node'
            const activeQuery = 'sactive.eq.true'
            let query = 'select=scoordinate%2Cscode%2Cstype%2Csorigin&where='

            if (opts.filter?.filterString) {
               query += `and(${activeQuery},${opts.filter.filterString})`
            } else {
               query += activeQuery
            }

            const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,${datasetType}/${layer.stationType}/?limit=-1&distinct=true&${query}`

            const { data } = await useFetchWithAuth(url).json()
            flatData = ((data.value?.data as DataPoint[]) || []) as DataPoint[]
         }

         if (flatData && flatData.length > 0) {
            const fetchedEvents: Record<
               string,
               Record<
                  string,
                  {
                     stations: Record<
                        string,
                        {
                           sdatatypes: Record<
                              string,
                              {
                                 tmeasurements: Array<{
                                    mperiod: number
                                    mvalidtime: string
                                    mvalue: number
                                 }>
                              }
                           >
                        }
                     >
                  }
               >
            > = {}

            const newPoints: DataMarker[] = []
            for (const d of flatData) {
               const typedDataPoint = d as DataPoint
               const typedAnnouncement = d as AnnouncementEvent
               const stype = isProvinceEvents
                  ? (() => {
                       const tags = typedAnnouncement.TagIds || []
                       // Example:
                       // ["announcement:traffic-event", "traffic-event:current", "traffic-event:accident"]
                       // -> take last entry as classification
                       const lastTag =
                          tags.length > 0 ? tags[tags.length - 1] : undefined
                       const classification =
                          lastTag && lastTag.startsWith('traffic-event:')
                             ? lastTag
                             : 'traffic-event:restriction'

                       return `PROVINCE_BZ/${classification}`
                    })()
                  : typedDataPoint.stype
               if (!opts.uniqueOrigins[stype]) {
                  opts.uniqueOrigins[stype] = new Set()
               }
               const origin = isProvinceEvents
                  ? typedAnnouncement.Source ||
                    typedAnnouncement._Meta?.Source ||
                    'PROVINCE_BZ'
                  : typedDataPoint.sorigin
               opts.uniqueOrigins[stype].add(origin)

               // Province events filter is handled in MapView; for now include all

               const fetchedEventsKey = Array.isArray(layer.stationType)
                  ? layer.stationType.join('_')
                  : layer.stationType
               if (!isProvinceEvents && !fetchedEvents[fetchedEventsKey]) {
                  let query_where_datatypes = ''
                  let datatype_period_duplicates: Record<string, boolean> = {}

                  const measurementTypes = getMeasurementTypesFromAlarmConfig(
                     typedDataPoint.stype
                  )
                  if (Object.keys(measurementTypes).length > 0) {
                     for (const tnameKey in measurementTypes) {
                        for (const mperiodKey in measurementTypes[tnameKey]) {
                           const duplicatesKey = tnameKey + '_' + mperiodKey
                           if (!datatype_period_duplicates[duplicatesKey]) {
                              datatype_period_duplicates[duplicatesKey] = true
                              let query_datatype =
                                 'and(mperiod.eq.' +
                                 mperiodKey +
                                 ',tname.eq."' +
                                 tnameKey.replace(/(['"\(\)\\])/g, '\\$1') +
                                 '")'
                              query_where_datatypes +=
                                 (query_where_datatypes === '' ? 'or(' : ',') +
                                 query_datatype
                           }
                        }
                     }
                  }

                  if (query_where_datatypes) {
                     query_where_datatypes += ')'
                     try {
                        const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${layer.stationType}/*/latest?limit=-1&distinct=true&select=tmeasurements&showNull=true&where=${encodeURIComponent(query_where_datatypes)}`
                        const { data } = await useFetchWithAuth(dataUrl).json()
                        fetchedEvents[fetchedEventsKey] = data.value?.data || {}
                     } catch (error) {
                        console.error(
                           `Error fetching data for ${fetchedEventsKey}:`,
                           error
                        )
                        fetchedEvents[fetchedEventsKey] = {}
                     }
                  } else {
                     fetchedEvents[fetchedEventsKey] = {}
                  }
               }

               const scode = isProvinceEvents
                  ? typedAnnouncement.Id
                  : typedDataPoint.scode

               let lastDiffHours: number | undefined = undefined
               let lastMeasurement:
                  | (DataPoint & { mperiod: number; dataType: string })
                  | undefined = undefined

               if (
                  !isProvinceEvents &&
                  fetchedEvents[fetchedEventsKey] &&
                  fetchedEvents[fetchedEventsKey][stype] &&
                  fetchedEvents[fetchedEventsKey][stype].stations &&
                  fetchedEvents[fetchedEventsKey][stype].stations[scode]
               ) {
                  const station =
                     fetchedEvents[fetchedEventsKey][stype].stations[scode]
                  for (const dataType in station.sdatatypes) {
                     const measurements =
                        station.sdatatypes[dataType].tmeasurements
                     if (measurements && measurements.length > 0) {
                        const measurement = measurements[0]
                        if (measurement.mvalidtime) {
                           const diffHours = differenceInHours(
                              now,
                              new Date(measurement.mvalidtime)
                           )
                           if (
                              lastDiffHours === undefined ||
                              diffHours < lastDiffHours
                           ) {
                              lastDiffHours = diffHours
                              ;(lastMeasurement as any) = {
                                 ...measurement,
                                 dataType,
                              }
                           }
                        }
                     }
                  }
               }

               newPoints.push({
                  scode,
                  sname: isProvinceEvents
                     ? typedAnnouncement.Shortname ||
                       typedAnnouncement.Detail?.it?.Title ||
                       typedAnnouncement.Detail?.de?.Title ||
                       typedAnnouncement.Id
                     : typedDataPoint.sname,
                  color: (layer as any).color,
                  iconColor: (layer as any).iconColor,
                  stype,
                  coordinates: isProvinceEvents
                     ? [
                          typedAnnouncement.Geo?.position?.Longitude || 0,
                          typedAnnouncement.Geo?.position?.Latitude || 0,
                       ]
                     : [
                          typedDataPoint.scoordinate?.x || 0,
                          typedDataPoint.scoordinate?.y || 0,
                       ],
                  infoColor: isProvinceEvents
                     ? undefined
                     : lastMeasurement && opts.computeInfoColor
                       ? opts.computeInfoColor({
                            stype,
                            dataType: (lastMeasurement as any).dataType,
                            value: Number((lastMeasurement as any).mvalue),
                            diffHours: lastDiffHours || 0,
                            period: (lastMeasurement as any).mperiod,
                         })
                       : undefined,
                  eventData: isProvinceEvents
                     ? (typedAnnouncement as AnnouncementEvent)
                     : undefined,
               })
            }

            const uniquePoints = new Set(currentMarkers.map((p) => p.scode))
            newMarkers.push(
               ...newPoints.filter((point) => !uniquePoints.has(point.scode))
            )
         } else {
            showNotification({
               type: 'error',
               message: opts.t('views.map.noDataFor', {
                  name: (Array.isArray(layer.stationType)
                     ? layer.stationType
                     : [layer.stationType]
                  ).join(', '),
               }),
            })
         }

         return applyProvinceFilter(newMarkers, now)
      } catch (err) {
         console.error('An error occurred while processing the data:', err)
      }
   }

   // Toggle fetch for multiple layers
   const toggleAllLayers = async (
      layers: Layer[],
      ctx: {
         selectedFilterOrigins: SelectedFilterOrigins
         uniqueOrigins: Record<string, Set<string>>
         markers: DataMarker[]
         t: (key: string, params?: any) => string
         computeInfoColor?: (args: {
            stype: string
            dataType: string
            value: number
            diffHours: number
            period?: number
         }) => string | undefined
      }
   ): Promise<DataMarker[]> => {
      const newMarkers: DataMarker[] = []
      for (const layer of layers) {
         const stationTypes = Array.isArray(layer.stationType)
            ? layer.stationType
            : [layer.stationType]

         let hasFilters = false
         let filteredStationTypes: string[] = []
         for (const stype of stationTypes) {
            if (ctx.selectedFilterOrigins.sorigin[stype]?.length > 0) {
               hasFilters = true
               filteredStationTypes.push(stype)
            }
         }

         if (hasFilters) {
            for (const stype of filteredStationTypes) {
               const filterStrings = Object.entries(
                  ctx.selectedFilterOrigins.sorigin
               )
                  .filter(([key]) => stationTypes.includes(key))
                  .map(([key, values]) => buildOriginFilterString(values))
               const filterString = filterStrings.join(',')
               const stypeFilteredMarkers = await fetchStationData(layer, {
                  currentMarkers: newMarkers.length ? newMarkers : ctx.markers,
                  filter: { stype, filterString },
                  uniqueOrigins: ctx.uniqueOrigins,
                  t: ctx.t,
                  computeInfoColor: ctx.computeInfoColor,
               })
               if (stypeFilteredMarkers)
                  newMarkers.push(...stypeFilteredMarkers)
            }

            const unfilteredTypes = stationTypes.filter(
               (s) => !filteredStationTypes.includes(s)
            )
            if (unfilteredTypes.length > 0) {
               const unfilteredLayer = {
                  ...layer,
                  stationType: unfilteredTypes,
               }
               const unfilteredMarkers = await fetchStationData(
                  unfilteredLayer,
                  {
                     currentMarkers: newMarkers.length
                        ? newMarkers
                        : ctx.markers,
                     uniqueOrigins: ctx.uniqueOrigins,
                     t: ctx.t,
                     computeInfoColor: ctx.computeInfoColor,
                  }
               )
               if (unfilteredMarkers) newMarkers.push(...unfilteredMarkers)
            }
         } else {
            const unfilteredMarkers = await fetchStationData(layer, {
               currentMarkers: newMarkers.length ? newMarkers : ctx.markers,
               uniqueOrigins: ctx.uniqueOrigins,
               t: ctx.t,
               computeInfoColor: ctx.computeInfoColor,
            })
            if (unfilteredMarkers) newMarkers.push(...unfilteredMarkers)
         }
      }
      return applyProvinceFilter(newMarkers, new Date())
   }

   // Centralized refresh that updates the shared store
   const refreshSelectedLayers = async (
      layers: Layer[],
      ctx: {
         selectedFilterOrigins: SelectedFilterOrigins
         uniqueOrigins: Record<string, Set<string>>
         markers: DataMarker[]
         t: (key: string, params?: any) => string
         computeInfoColor?: (args: {
            stype: string
            dataType: string
            value: number
            diffHours: number
            period?: number
         }) => string | undefined
      }
   ): Promise<DataMarker[]> => {
      const fetched = await toggleAllLayers(layers, ctx)
      layerData.setMarkers(fetched)
      return fetched
   }

   // Fetch all relevant measurements for selected layers to evaluate alarms
   const getMeasurementsForSelectedLayers = async (
      layers: Layer[],
      ctx: {
         selectedFilterOrigins: SelectedFilterOrigins
         t: (key: string, params?: any) => string
         skipProvinceEvents?: boolean
      }
   ): Promise<StationMeasurement[]> => {
      const stationInfo: Record<
         string,
         { sname: string; coords: [number, number]; stype: string }
      > = {}
      const measurementsOut: StationMeasurement[] = []

      for (const layer of layers) {
         const stationTypes = Array.isArray(layer.stationType)
            ? layer.stationType
            : [layer.stationType]
         let hasFilters = false
         const filtered: string[] = []
         for (const stype of stationTypes) {
            if (ctx.selectedFilterOrigins.sorigin[stype]?.length > 0) {
               hasFilters = true
               filtered.push(stype)
            }
         }

         const fetchFlat = async (
            stypeList: string[],
            filterString?: string
         ) => {
            if (ctx.skipProvinceEvents && stypeList.includes('PROVINCE_BZ')) {
               return
            }

            const activeQuery = 'sactive.eq.true'
            let query =
               'select=scoordinate%2Cscode%2Cstype%2Csname%2Csorigin&where='
            if (filterString) query += `and(${activeQuery},${filterString})`
            else query += activeQuery
            const url = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat,node/${stypeList}/?limit=-1&distinct=true&${query}`
            const { data } = await useFetchWithAuth(url).json()
            const flat = (data.value?.data as DataPoint[]) || []
            for (const d of flat) {
               stationInfo[d.scode] = {
                  sname: d.sname,
                  coords: [d.scoordinate?.x || 0, d.scoordinate?.y || 0],
                  stype: d.stype,
               }
            }
         }

         if (hasFilters) {
            const filterStrings = Object.entries(
               ctx.selectedFilterOrigins.sorigin
            )
               .filter(([key]) => stationTypes.includes(key))
               .map(([_, values]) => buildOriginFilterString(values))
            const filterString = filterStrings.join(',')
            await fetchFlat(filtered, filterString)
            const unfiltered = stationTypes.filter((s) => !filtered.includes(s))
            if (unfiltered.length) await fetchFlat(unfiltered)
         } else {
            await fetchFlat(stationTypes)
         }
      }

      const byStype: Record<string, string[]> = {}
      Object.values(stationInfo).forEach((v) => {
         byStype[v.stype] = byStype[v.stype] || []
      })

      for (const stype of Object.keys(byStype)) {
         const tmap = getMeasurementTypesFromAlarmConfig(stype)
         if (Object.keys(tmap).length === 0) continue
         let where = ''
         for (const tnameKey in tmap) {
            for (const mperiodKey in tmap[tnameKey]) {
               const q = `and(mperiod.eq.${mperiodKey},tname.eq."${tnameKey.replace(/(['"\(\)\\])/g, '\\$1')}")`
               where += (where === '' ? 'or(' : ',') + q
            }
         }
         if (where) where += ')'
         else continue
         const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/tree/${stype}/*/latest?limit=-1&distinct=true&select=tmeasurements&showNull=true&where=${encodeURIComponent(where)}`
         try {
            const { data } = await useFetchWithAuth(dataUrl).json()
            const treeData = (data.value?.data || {}) as any
            const typed = treeData[stype]?.stations || {}
            for (const scode of Object.keys(typed)) {
               const info = stationInfo[scode]
               if (!info) continue
               const sdatatypes = typed[scode]?.sdatatypes || {}
               for (const dataType in sdatatypes) {
                  const tms = sdatatypes[dataType]?.tmeasurements || []
                  for (const m of tms) {
                     measurementsOut.push({
                        stationType: stype,
                        measurement: dataType,
                        value: Number(m.mvalue),
                        timestamp: new Date(m.mvalidtime),
                        stationName: info.sname,
                        coordinates: info.coords,
                     })
                  }
               }
            }
         } catch (e) {
            console.error('Failed to fetch measurements for', stype, e)
         }
      }

      return measurementsOut
   }

   const refetchForDataTypeWithFilters = async (
      newVal: SelectedFilterOrigins,
      ctx: {
         selectedLayers: Layer[]
         currentMarkers: DataMarker[]
         uniqueOrigins: Record<string, Set<string>>
         t: (key: string, params?: any) => string
         computeInfoColor?: (args: {
            stype: string
            dataType: string
            value: number
            diffHours: number
            period?: number
         }) => string | undefined
      }
   ): Promise<DataMarker[] | undefined> => {
      const layer = ctx.selectedLayers.find((l) =>
         (Array.isArray(l.stationType)
            ? l.stationType
            : [l.stationType]
         ).includes(newVal.stype)
      )
      if (!layer || !newVal.sorigin[newVal.stype]) return ctx.currentMarkers
      const filterString = buildOriginFilterString(newVal.sorigin[newVal.stype])
      return await fetchStationData(layer, {
         currentMarkers: ctx.currentMarkers.filter(
            (m) => m.stype !== newVal.stype
         ),
         filter: { stype: newVal.stype, filterString },
         uniqueOrigins: ctx.uniqueOrigins,
         t: ctx.t,
         computeInfoColor: ctx.computeInfoColor,
      })
   }

   const setLayersToMap = async (
      curr: Layer[],
      old: Layer[],
      ctx: {
         markers: DataMarker[]
         selectedFilterOrigins: SelectedFilterOrigins
         uniqueOrigins: Record<string, Set<string>>
         t: (key: string, params?: any) => string
         computeInfoColor?: (args: {
            stype: string
            dataType: string
            value: number
            diffHours: number
            period?: number
         }) => string | undefined
      }
   ): Promise<DataMarker[]> => {
      const newMarkersOut: DataMarker[] = []
      const currIds = new Set(curr.map((l) => l.id))
      const oldIds = new Set(old.map((l) => l.id))
      const added = curr.find((l) => !oldIds.has(l.id))
      if (added) {
         const stationTypes = Array.isArray(added.stationType)
            ? added.stationType
            : [added.stationType]
         let hasAppliedFilter = false
         for (const stype of stationTypes) {
            if (ctx.selectedFilterOrigins.sorigin[stype]?.length > 0) {
               const filterString = buildOriginFilterString(
                  ctx.selectedFilterOrigins.sorigin[stype]
               )
               const filtered = await fetchStationData(added, {
                  currentMarkers: newMarkersOut.length
                     ? newMarkersOut
                     : ctx.markers,
                  filter: { stype, filterString },
                  uniqueOrigins: ctx.uniqueOrigins,
                  t: ctx.t,
                  computeInfoColor: ctx.computeInfoColor,
               })
               if (filtered) {
                  newMarkersOut.push(...filtered)
                  hasAppliedFilter = true
               }
            }
         }
         if (!hasAppliedFilter) {
            const unfiltered = await fetchStationData(added, {
               currentMarkers: ctx.markers,
               uniqueOrigins: ctx.uniqueOrigins,
               t: ctx.t,
               computeInfoColor: ctx.computeInfoColor,
            })
            if (unfiltered) newMarkersOut.push(...unfiltered)
         }
         const uniquePoints = new Set(ctx.markers.map((p) => p.scode))
         const merged = [
            ...ctx.markers,
            ...newMarkersOut.filter((point) => !uniquePoints.has(point.scode)),
         ]
         return applyProvinceFilter(merged, new Date())
      }
      const newTypes = new Set(curr.flatMap((n) => n.stationType))
      const oldTypes = old.flatMap((o) => o.stationType)
      const diff = oldTypes.filter((ot) => !newTypes.has(ot))
      let updated = ctx.markers
      diff.forEach((d) => {
         const isProvinceBZ = d === 'PROVINCE_BZ'
         updated = isProvinceBZ
            ? updated.filter((p) => !p.stype.startsWith(d))
            : updated.filter((p) => p.stype !== d)
         if (isProvinceBZ) {
            const keysToRemove = Object.keys(ctx.uniqueOrigins).filter((k) =>
               k.startsWith(d)
            )
            keysToRemove.forEach((k) => delete ctx.uniqueOrigins[k])
         } else {
            delete ctx.uniqueOrigins[d]
         }
      })
      return applyProvinceFilter(updated, new Date())
   }

   return {
      ensureAlarmConfigLoaded,
      buildOriginFilterString,
      getMeasurementTypesFromAlarmConfig,
      fetchStationData,
      toggleAllLayers,
      refreshSelectedLayers,
      getMeasurementsForSelectedLayers,
      refetchForDataTypeWithFilters,
      setLayersToMap,
   }
}
