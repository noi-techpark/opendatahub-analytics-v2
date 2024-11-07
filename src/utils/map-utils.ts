// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Map } from 'maplibre-gl'

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

      style: {
         version: 8,
         sources: {
            'raster-tiles': {
               type: 'raster',
               tiles: [
                  'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                  // 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                  // 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
               ],
               tileSize: 256,
               attribution:
                  '<a target="_blank" href="https://www.opendatahub.com">OpenDataHub.com</a> | Map tiles by <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> and <a href="https://carto.com/" target="_blank">Carto</a>',
            },
         },
         layers: [
            {
               id: 'simple-tiles',
               type: 'raster',
               source: 'raster-tiles',
               minzoom: 0,
               maxzoom: 19,
            },
         ],
         glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      },
      center: [11.3295, 46.4896],
      zoom: 13,
      maxZoom: 18,
      minZoom: 6,
   })
}
