// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Map } from 'maplibre-gl'

/**
 * The MapLibre style used by the map.
 *
 * Defaults to OpenFreeMap's Positron style: it needs no API key, has no request
 * limits and comes closest to the look of the Carto "light_all" raster tiles
 * used before. Set VITE_MAP_STYLE_URL to point an environment at another
 * provider (or at a self-hosted style) without a code change.
 */
export const mapStyleUrl =
   import.meta.env.VITE_MAP_STYLE_URL ||
   'https://tiles.openfreemap.org/styles/positron'

/**
 * The font stack used by the symbol layers added on top of the basemap.
 *
 * Glyphs are served by the style, so the fontstack has to be one the style
 * provides. OpenFreeMap ships the Noto Sans faces; a different style may
 * require a different name here.
 */
export const mapFontStack = ['Noto Sans Regular']

/**
 * The attribution shown on the map, in addition to the attribution that
 * MapLibre derives from the style's own sources (tile provider, OpenMapTiles
 * and OpenStreetMap).
 */
export const mapDefaultAttribution =
   '<a target="_blank" href="https://www.opendatahub.com">OpenDataHub.com</a>'

export const coordinatesInRange = (coordinates: number[]) => {
   if (!coordinates[0] || !coordinates[1]) return false
   return (
      (coordinates[0] - 90) * (coordinates[0] + 90) <= 0 &&
      (coordinates[1] - 90) * (coordinates[1] + 90) <= 0
   )
}

export const initMap = () => {
   return new Map({
      container: 'map',
      // The style brings its own sources, glyphs and sprites
      style: mapStyleUrl,
      center: [11.3295, 46.4896],
      zoom: 13,
      maxZoom: 18,
      minZoom: 4,
      attributionControl: { customAttribution: mapDefaultAttribution },
   })
}
