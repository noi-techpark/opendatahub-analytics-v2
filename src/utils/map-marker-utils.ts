// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { DataMarker } from '../types/api'

export const getMarkerKey = (marker: Pick<DataMarker, 'scode' | 'stype'>) =>
   JSON.stringify([marker.stype, marker.scode])

/**
 * Arrange exact-coordinate stations as equally spaced satellites around a
 * central group marker. The offsets are expressed in screen pixels so the
 * layout remains compact and circular at every zoom level.
 */
export const spreadOverlappingMarkers = (
   markers: DataMarker[]
): DataMarker[] => {
   const groups = new Map<string, DataMarker[]>()

   for (const marker of markers) {
      const [longitude, latitude] = marker.coordinates
      const key = `${longitude},${latitude}`
      const group = groups.get(key)
      if (group) group.push(marker)
      else groups.set(key, [marker])
   }

   const overlapRendering = new Map<
      string,
      {
         overlapSatellite: true
         overlapGroupCenter: boolean
         overlapGroupDominant: boolean
         overlapGroupKey: string
         overlapGroupSize: number
         overlapGroupRadiusPixels: number
         overlapOffset: [number, number]
         overlapSatelliteScale: number
      }
   >()

   for (const group of groups.values()) {
      if (group.length < 2) continue

      const countByStationType = new Map<string, number>()
      for (const marker of group) {
         countByStationType.set(
            marker.stype,
            (countByStationType.get(marker.stype) || 0) + 1
         )
      }
      const dominantStationType = [...countByStationType.entries()].sort(
         ([stypeA, countA], [stypeB, countB]) =>
            countB - countA || stypeA.localeCompare(stypeB)
      )[0][0]

      group.sort((a, b) => {
         const dominantOrder =
            Number(b.stype === dominantStationType) -
            Number(a.stype === dominantStationType)
         return dominantOrder || getMarkerKey(a).localeCompare(getMarkerKey(b))
      })

      const useTwoRings = group.length > 18
      const innerRadiusPixels = 39
      const outerRadiusPixels = useTwoRings
         ? 64
         : Math.min(56, Math.max(48, 44 + group.length))
      const innerRingSize = useTwoRings
         ? Math.round(
              (group.length * innerRadiusPixels) /
                 (innerRadiusPixels + outerRadiusPixels)
           )
         : 0
      const satelliteScale = useTwoRings
         ? Math.max(0.58, 0.72 - (group.length - 19) * 0.006)
         : Math.max(0.68, 0.92 - (group.length - 2) * 0.025)

      group.forEach((marker, index) => {
         const isInnerRing = useTwoRings && index < innerRingSize
         const ringSize = isInnerRing
            ? innerRingSize
            : group.length - innerRingSize
         const ringIndex = isInnerRing ? index : index - innerRingSize
         const radiusPixels = isInnerRing
            ? innerRadiusPixels
            : outerRadiusPixels
         const phaseOffset = isInnerRing ? Math.PI / ringSize : 0
         const angle =
            -Math.PI / 2 + phaseOffset + (ringIndex * 2 * Math.PI) / ringSize

         overlapRendering.set(getMarkerKey(marker), {
            overlapSatellite: true,
            overlapGroupCenter: index === 0,
            overlapGroupDominant: index === 0,
            overlapGroupKey: `${marker.coordinates[0]},${marker.coordinates[1]}`,
            overlapGroupSize: group.length,
            overlapGroupRadiusPixels: outerRadiusPixels + 11,
            overlapOffset: [
               (radiusPixels * Math.cos(angle)) / satelliteScale,
               (radiusPixels * Math.sin(angle)) / satelliteScale,
            ],
            overlapSatelliteScale: satelliteScale,
         })
      })
   }

   return markers.map((marker) => {
      const rendering = overlapRendering.get(getMarkerKey(marker))
      return rendering ? { ...marker, ...rendering } : marker
   })
}
