// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const infoIconHoursThresholds: Record<
   string,
   Record<
      string,
      Record<
         string,
         {
            green: { min: number; max: number }
            yellow: { min: number; max: number }
            red: { min: number; max: number }
         }
      >
   >
> = {
   MeteoStation: {
      precipitation: {
         '300': {
            green: {
               min: 0,
               max: 0.1,
            },
            yellow: {
               min: 0.1,
               max: 1,
            },
            red: {
               min: 1,
               max: 99999,
            },
         },
         '600': {
            green: {
               min: 0,
               max: 0.1,
            },
            yellow: {
               min: 0.1,
               max: 1,
            },
            red: {
               min: 1,
               max: 99999,
            },
         },
         '900': {
            green: {
               min: 0,
               max: 0.1,
            },
            yellow: {
               min: 0.1,
               max: 1,
            },
            red: {
               min: 1,
               max: 99999,
            },
         },
      },
      'air-temperature': {},
   },
   EnvironmentStation: {
      'nitrogen-dioxide': {
         '3600': {
            green: {
               min: 0,
               max: 40,
            },
            yellow: {
               min: 40,
               max: 60,
            },
            red: {
               min: 60,
               max: 99999,
            },
         },
         '600': {
            green: {
               min: 0,
               max: 40,
            },
            yellow: {
               min: 40,
               max: 60,
            },
            red: {
               min: 60,
               max: 99999,
            },
         },
      },
      'NO2 - Ossidi di azoto': {
         '3600': {
            green: {
               min: 0,
               max: 40,
            },
            yellow: {
               min: 40,
               max: 60,
            },
            red: {
               min: 60,
               max: 99999,
            },
         },
      },
      'Biossido di Azoto': {
         '600': {
            green: {
               min: 0,
               max: 40,
            },
            yellow: {
               min: 40,
               max: 60,
            },
            red: {
               min: 60,
               max: 99999,
            },
         },
      },
      'NO2-Alphasense_processed': {
         '3600': {
            green: {
               min: 0,
               max: 40,
            },
            yellow: {
               min: 40,
               max: 60,
            },
            red: {
               min: 60,
               max: 99999,
            },
         },
      },
      'particulate-matter10': {},
   },
   ParkingStation: {
      free: {
         '300': {
            green: {
               min: 100,
               max: 99999,
            },
            yellow: {
               min: 10,
               max: 100,
            },
            red: {
               min: 0,
               max: 10,
            },
         },
      },
   },
   ParkingSensor: {
      free: {
         '300': {
            green: {
               min: 100,
               max: 99999,
            },
            yellow: {
               min: 10,
               max: 100,
            },
            red: {
               min: 0,
               max: 10,
            },
         },
         '1': {
            green: {
               min: 1,
               max: 99999,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
   },
   ParkingFacility: {
      free: {
         '300': {
            green: {
               min: 100,
               max: 99999,
            },
            yellow: {
               min: 10,
               max: 100,
            },
            red: {
               min: 0,
               max: 10,
            },
         },
      },
   },
   BikeParking: {
      free: {
         '600': {
            green: {
               min: 100,
               max: 99999,
            },
            yellow: {
               min: 10,
               max: 100,
            },
            red: {
               min: 0,
               max: 10,
            },
         },
      },
   },
   BluetoothStation: {
      'Bluetooth Count record': {
         '600': {
            green: {
               min: 0,
               max: 75,
            },
            yellow: {
               min: 75,
               max: 150,
            },
            red: {
               min: 150,
               max: 99999,
            },
         },
      },
   },
   TrafficSensor: {
      'Average Speed Light Vehicles': {
         '600': {
            green: {
               min: 120,
               max: 99999,
            },
            yellow: {
               min: 100,
               max: 120,
            },
            red: {
               min: 0,
               max: 100,
            },
         },
      },
      'average-vehicle-speed': {
         '600': {
            green: {
               min: 40,
               max: 99999,
            },
            yellow: {
               min: 26,
               max: 40,
            },
            red: {
               min: 0,
               max: 25,
            },
         },
      },
   },
   TrafficDirection: {
      'Average Speed Light Vehicles': {
         '600': {
            green: {
               min: 120,
               max: 99999,
            },
            yellow: {
               min: 100,
               max: 120,
            },
            red: {
               min: 0,
               max: 100,
            },
         },
      },
      'average-vehicle-speed': {
         '600': {
            green: {
               min: 40,
               max: 99999,
            },
            yellow: {
               min: 26,
               max: 40,
            },
            red: {
               min: 0,
               max: 25,
            },
         },
      },
   },
   BikeCounter: {
      'vehicle detection (count)': {
         '3600': {
            green: {
               min: 0,
               max: 49,
            },
            yellow: {
               min: 50,
               max: 149,
            },
            red: {
               min: 150,
               max: 999999,
            },
         },
      },
   },
   RWISstation: {
      'ground-surface-temperature': {
         '600': {
            green: {
               min: 0,
               max: 99999,
            },
            yellow: {
               min: -5,
               max: 0,
            },
            red: {
               min: -99999,
               max: -5,
            },
         },
      },
      temp_suolo: {
         '1': {
            green: {
               min: 0,
               max: 99999,
            },
            yellow: {
               min: -5,
               max: 0,
            },
            red: {
               min: -99999,
               max: -5,
            },
         },
      },
   },
   CarsharingStation: {
      'number-available': {
         '600': {
            green: {
               min: 2,
               max: 100,
            },
            yellow: {
               min: 1,
               max: 2,
            },
            red: {
               min: 0,
               max: 1,
            },
         },
      },
   },
   BikesharingStation: {
      'number-available': {
         '300': {
            green: {
               min: 1,
               max: 100,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
      availability: {
         '300': {
            green: {
               min: 1,
               max: 100,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
   },
   Bicycle: {
      'number-available': {
         '300': {
            green: {
               min: 1,
               max: 100,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
      availability: {
         '300': {
            green: {
               min: 1,
               max: 100,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
   },
   EChargingStation: {
      'number-available': {
         '600': {
            green: {
               min: 2,
               max: 100,
            },
            yellow: {
               min: 1,
               max: 2,
            },
            red: {
               min: 0,
               max: 1,
            },
         },
      },
   },
   BIKE_CHARGER: {
      freebay: {
         '300': {
            green: {
               min: 2,
               max: 100,
            },
            yellow: {
               min: 1,
               max: 2,
            },
            red: {
               min: 0,
               max: 1,
            },
         },
      },
   },
   VMS: {
      stato: {
         '1': {
            green: {
               min: 1,
               max: 2,
            },
            red: {
               min: 0,
               max: 1,
            },
            yellow: {
               min: 0,
               max: 0,
            },
         },
      },
   },
   LinkStation: {},
   PROVINCE_BZ: {},
}

export const getInfoMarkerColorDifferenceThreshold = (
   stationType: string,
   dataType: string,
   periodTaken: string | number,
   value: number,
   hoursFromNow: number
): string | undefined => {
   if (hoursFromNow > 24) return '#ddd'

   const threshold = infoIconHoursThresholds[stationType][dataType][periodTaken]
   if (!threshold) return undefined

   if (value >= threshold.green.min && hoursFromNow <= threshold.green.max)
      return '#34c759'
   if (value >= threshold.yellow.min && hoursFromNow <= threshold.yellow.max)
      return '#ffd600'
   if (value >= threshold.red.min && hoursFromNow <= threshold.red.max)
      return '#ff4d4f'

   return '#ddd'
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
      // Province events: use new road-signs icon pack
      PROVINCE_BZ: '/markers/icons/road-signs/cluster-road-signals.svg',

      // Specific PROVINCE_BZ event types mapped to new icons
      'PROVINCE_BZ/UNFALL':
         '/markers/icons/road-signs/restrictions-accident.svg',
      'PROVINCE_BZ/SPERRE':
         '/markers/icons/road-signs/restrictions-traffic_blocked.svg',
      'PROVINCE_BZ/STAU': '/markers/icons/road-signs/restrictions-slowdown.svg',
      'PROVINCE_BZ/RADWEG_SPERRE':
         '/markers/icons/road-signs/restrictions-no_access_for_bicycles.svg',
      'PROVINCE_BZ/BAUSTELLE':
         '/markers/icons/road-signs/warning-work_in_progress.svg',
      'PROVINCE_BZ/VORSICHT':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/EINENGUNG':
         '/markers/icons/road-signs/warning-lane_closed.svg',
      'PROVINCE_BZ/AMPELREGELUNG':
         '/markers/icons/road-signs/warning-lane_closed.svg',
      'PROVINCE_BZ/RADAR':
         '/markers/icons/road-signs/controls-speed_camera.svg',
      // Reasonable fallbacks for events without a dedicated icon in the pack
      'PROVINCE_BZ/OELSPUR':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/KREISVERKEHR':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/EISENBAHN':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/WINDBOEHEN':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/GEGENVERKEHR':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/TIERE_AUF_FAHRB':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/WINTERAUSRUEST':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/MESSE_BOZEN':
         '/markers/icons/road-signs/warning-general_danger.svg',
      'PROVINCE_BZ/SCHNEEFALL':
         '/markers/icons/road-signs/warning-general_danger.svg',
   }

   return (
      map[stationType] ||
      (stationType.startsWith('PROVINCE_BZ')
         ? map[stationType] || map['PROVINCE_BZ']
         : '/markers/icons/gear.svg')
   )
}

export const createMarkerIcon = async (
   svgUrl: string,
   iconUrl?: string,
   iconBoxSize: number = 22
): Promise<HTMLCanvasElement> => {
   return new Promise((resolve, reject) => {
      const svgImg = new window.Image()
      svgImg.onload = () => {
         const canvas = document.createElement('canvas')
         // Render at 2x for crisper text, then register with pixelRatio: 2
         const scale = 1.5
         const baseWidth = 69
         const baseHeight = 76
         canvas.width = baseWidth * scale
         canvas.height = baseHeight * scale
         const ctx = canvas.getContext('2d')
         if (!ctx) return reject('No ctx')

         ctx.imageSmoothingEnabled = iconUrl ? !iconUrl.includes('svg') : true

         // Draw SVG scaled to canvas size
         ctx.drawImage(svgImg, 0, 0, canvas.width, canvas.height)
         if (!iconUrl) {
            return resolve(canvas)
         }

         const iconImg = new window.Image()
         iconImg.onload = () => {
            // Draw the icon centered inside the inner circle area
            let drawWidth = iconImg.width
            let drawHeight = iconImg.height
            if (drawWidth > drawHeight) {
               drawHeight = iconBoxSize * scale * (drawHeight / drawWidth)
               drawWidth = iconBoxSize * scale
            } else {
               drawWidth = iconBoxSize * scale * (drawWidth / drawHeight)
               drawHeight = iconBoxSize * scale
            }
            // Precisely center inside the upper part of the ellipse (cx=34.7162, cy=30.7162)
            const ellipseCx = 34.7162
            const ellipseCy = 30.7162
            const hemisphereUpNudge = 3.7 // px upward to stay in the upper white area
            const innerBoxX = (ellipseCx - iconBoxSize / 2) * scale
            const innerBoxY =
               (ellipseCy - iconBoxSize / 2 - hemisphereUpNudge) * scale
            const iconX = innerBoxX + (iconBoxSize * scale - drawWidth) / 2
            const iconYOffset = -5
            const iconY =
               innerBoxY + (iconBoxSize * scale - drawHeight) / 2 + iconYOffset
            ctx.drawImage(iconImg, iconX, iconY, drawWidth, drawHeight)

            resolve(canvas)
         }
         iconImg.onerror = reject
         iconImg.src = iconUrl
      }
      svgImg.onerror = reject
      // Ensure fonts are loaded so SVG <text> renders with SourceSansPro
      try {
         // @ts-ignore
         const fonts = document?.fonts
         if (fonts && fonts.load) {
            Promise.all([
               fonts.load('700 16px SourceSansPro'),
               fonts.load('400 10px SourceSansPro'),
            ])
               .catch(() => void 0)
               .finally(() => (svgImg.src = svgUrl))
            return
         }
      } catch (_) {
         // noop
      }
      svgImg.src = svgUrl
   })
}

export const getBaseMarkerSvgUrl = (
   markerColor: string,
   letter?: string,
   showOne?: boolean
) => {
   // Teardrop marker approximating the provided example, with an inner circle filled by markerColor
   const safeLetter = (letter || '').slice(0, 1).toUpperCase()
   const letterSvg = safeLetter
      ? `<text x="50%" y="35%" dominant-baseline="middle" text-anchor="middle" fill="#1C1B1F" font-size="18" font-weight="700" font-family="SourceSansPro, Arial, sans-serif">${safeLetter}</text>`
      : ''
   const oneSvg = showOne
      ? `<text x="50%" y="72%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-size="8" font-weight="600" font-family="SourceSansPro, Arial, sans-serif">1</text>`
      : ''
   const markerSvg = `
   <svg width="69" height="76" viewBox="0 0 69 76" fill="none" xmlns="http://www.w3.org/2000/svg" text-rendering="geometricPrecision">
     <defs>
       <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="160%" color-interpolation-filters="sRGB">
         <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.18"/>
       </filter>
     </defs>
     <g>
       <path filter="url(#markerShadow)" d="M54.8432 53.2249C61.0773 47.6404 65 39.5283 65 30.5C65 13.6553 51.3447 0 34.5 0C17.6553 0 4 13.6553 4 30.5C4 39.5283 7.92275 47.6404 14.1568 53.2249C14.1776 53.246 14.1984 53.2669 14.2194 53.2879L24.591 63.6595C30.0636 69.1321 38.9364 69.1321 44.409 63.6595L54.7806 53.2879C54.8016 53.2669 54.8224 53.246 54.8432 53.2249Z" fill="white" stroke="#DADADA" stroke-width="1"/>
       <ellipse cx="34.7162" cy="30.7162" rx="24.7162" ry="24.7162" fill="${markerColor}" />
       <path d="M23.5 55.5L11.5 43.5L9.5 39.5H60.5L59.5 43L52.5 53.5L45 56.5L31 58L23.5 55.5Z" fill="white"/>
       ${letterSvg}
       ${oneSvg}
     </g>
   </svg>`
   return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markerSvg)
}
