// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Map } from 'maplibre-gl'

const infoIconHoursThresholds: Record<
   string,
   { green: number; yellow: number; red: number }
> = {
   MeteoStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   EnvironmentStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   ParkingStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   ParkingSensor: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   ParkingFacility: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   BikeParking: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   BluetoothStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   TrafficSensor: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   TrafficDirection: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   BikeCounter: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   RWISstation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   CarsharingStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   BikesharingStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   Bicycle: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   EChargingStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   BIKE_CHARGER: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   VMS: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   LinkStation: {
      green: 1,
      yellow: 2,
      red: 3,
   },
   PROVINCE_BZ: {
      green: 1,
      yellow: 2,
      red: 3,
   },
}

/**
 * Returns the PNG icon path for a given station type.
 * This is a basic mapping based on the provided JSON config and available PNGs in public/markers/icons.
 * If no match is found, returns a default icon.
 */
export function getIconForStationType(stationType: string): string {
   const map: Record<string, string> = {
      MeteoStation: '/markers/icons/weather.svg',
      EnvironmentStation: '/markers/icons/air-quality.svg',
      ParkingStation: '/markers/icons/parking.svg',
      ParkingSensor: '/markers/icons/parking.svg',
      ParkingFacility: '/markers/icons/parking.svg',
      BikeParking: '/markers/icons/parking.svg',
      BluetoothStation: '/markers/icons/bluetooth.svg',
      TrafficSensor: '/markers/icons/traffic.svg',
      TrafficDirection: '/markers/icons/traffic.svg',
      BikeCounter: '/markers/icons/traffic.svg',
      RWISstation: '/markers/icons/road-weather.svg',
      CarsharingStation: '/markers/icons/car-sharing.svg',
      BikesharingStation: '/markers/icons/bike-sharing.svg',
      Bicycle: '/markers/icons/bike-sharing.svg',
      EChargingStation: '/markers/icons/e-mobility.svg',
      BIKE_CHARGER: '/markers/icons/e-mobility.svg',
      VMS: '/markers/icons/vms.svg',
      LinkStation: '/markers/icons/vehicular-times.svg',
      PROVINCE_BZ: '/markers/icons/caution-multiple.svg',

      // Specific PROVINCE_BZ event types
      'PROVINCE_BZ/AMPELREGELUNG':
         '/markers/icons/PROVINCE_BZ/AMPELREGELUNG.gif',
      'PROVINCE_BZ/KREISVERKEHR': '/markers/icons/PROVINCE_BZ/KREISVERKEHR.gif',
      'PROVINCE_BZ/RADWEG_SPERRE':
         '/markers/icons/PROVINCE_BZ/RADWEG_SPERRE.gif',
      'PROVINCE_BZ/UNFALL': '/markers/icons/PROVINCE_BZ/UNFALL.gif',
      'PROVINCE_BZ/BAUSTELLE': '/markers/icons/PROVINCE_BZ/BAUSTELLE.gif',
      'PROVINCE_BZ/LKW_FAHRVERBOT':
         '/markers/icons/PROVINCE_BZ/LKW_FAHRVERBOT.gif',
      'PROVINCE_BZ/SCHNEEFALL': '/markers/icons/PROVINCE_BZ/SCHNEEFALL.gif',
      'PROVINCE_BZ/VIEHABTRIEB': '/markers/icons/PROVINCE_BZ/VIEHABTRIEB.gif',
      'PROVINCE_BZ/EINENGUNG': '/markers/icons/PROVINCE_BZ/EINENGUNG.gif',
      'PROVINCE_BZ/MESSE_BOZEN': '/markers/icons/PROVINCE_BZ/MESSE_BOZEN.gif',
      'PROVINCE_BZ/SPERRE': '/markers/icons/PROVINCE_BZ/SPERRE.gif',
      'PROVINCE_BZ/VORSICHT': '/markers/icons/PROVINCE_BZ/VORSICHT.gif',
      'PROVINCE_BZ/EISENBAHN': '/markers/icons/PROVINCE_BZ/EISENBAHN.gif',
      'PROVINCE_BZ/OELSPUR': '/markers/icons/PROVINCE_BZ/OELSPUR.gif',
      'PROVINCE_BZ/STAU': '/markers/icons/PROVINCE_BZ/STAU.gif',
      'PROVINCE_BZ/WINDBOEHEN': '/markers/icons/PROVINCE_BZ/WINDBOEHEN.gif',
      'PROVINCE_BZ/GEGENVERKEHR': '/markers/icons/PROVINCE_BZ/GEGENVERKEHR.gif',
      'PROVINCE_BZ/RADAR': '/markers/icons/PROVINCE_BZ/RADAR.gif',
      'PROVINCE_BZ/TIERE_AUF_FAHRB':
         '/markers/icons/PROVINCE_BZ/TIERE_AUF_FAHRB.gif',
      'PROVINCE_BZ/WINTERAUSRUEST':
         '/markers/icons/PROVINCE_BZ/WINTERAUSRUEST.gif',
   }

   return (
      map[stationType] ||
      (stationType.startsWith('PROVINCE_BZ')
         ? map['PROVINCE_BZ']
         : '/markers/icons/gear.svg')
   )
}

export const getMaxHoursForInfoIcon = (stationType: string): number => {
   const threshold = infoIconHoursThresholds[stationType]

   if (!threshold) return 0

   return Math.max(...Object.values(threshold))
}

export const getInfoMarkerColorDifferenceThreshold = (
   stationType: string,
   hoursFromNow: number
): string => {
   const threshold = infoIconHoursThresholds[stationType]
   if (!threshold) return ''

   if (hoursFromNow < threshold.green) return '#34c759'
   if (hoursFromNow < threshold.yellow) return '#ffd600'
   if (hoursFromNow < threshold.red) return '#ff4d4f'

   return '#ddd'
}

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

export const createMarkerIcon = async (
   svgUrl: string,
   iconUrl: string
): Promise<HTMLCanvasElement> => {
   return new Promise((resolve, reject) => {
      const svgImg = new window.Image()
      svgImg.onload = () => {
         const canvas = document.createElement('canvas')
         canvas.width = 48
         canvas.height = 72
         const ctx = canvas.getContext('2d')
         if (!ctx) return reject('No ctx')
         ctx.drawImage(svgImg, 0, 0)
         const iconImg = new window.Image()
         iconImg.onload = () => {
            // Draw the icon centered in a 32x32 box, maintaining aspect ratio
            const iconBoxSize = 32
            let drawWidth = iconImg.width
            let drawHeight = iconImg.height
            if (drawWidth > drawHeight) {
               drawHeight = iconBoxSize * (drawHeight / drawWidth)
               drawWidth = iconBoxSize
            } else {
               drawWidth = iconBoxSize * (drawWidth / drawHeight)
               drawHeight = iconBoxSize
            }
            const iconX = 8 + (iconBoxSize - drawWidth) / 2
            const iconY = 8 + (iconBoxSize - drawHeight) / 2
            ctx.drawImage(iconImg, iconX, iconY, drawWidth, drawHeight)

            resolve(canvas)
         }
         iconImg.onerror = reject
         iconImg.src = iconUrl
      }
      svgImg.onerror = reject
      svgImg.src = svgUrl
   })
}

export const getBaseMarkerSvgUrl = (markerColor: string) => {
   const markerSvg = `
   <svg
        width="48"
        height="72"
        viewBox="0 0 48 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
     >
        <circle cx="24" cy="64" r="8" fill="white" />
        <circle cx="24" cy="64" r="4" fill="${markerColor}" />
        <circle cx="24" cy="24" r="24" fill="${markerColor}" />
        <mask
           id="mask0_73_3169"
           style="mask-type: alpha"
           maskUnits="userSpaceOnUse"
           x="12"
           y="12"
           width="24"
           height="24"
        >
           <rect x="12" y="12" width="24" height="24" fill="${markerColor}"/>
        </mask>
     
        <path d="M24 64L19 46H29L24 64Z" fill="${markerColor}"/>
     </svg>
        `
   const svgUrl =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markerSvg)
   return svgUrl
}
