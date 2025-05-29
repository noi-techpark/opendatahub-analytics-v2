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

export const createMarkerIcon = async (
   svgUrl: string,
   iconUrl: string,
   iconBoxSize: number = 32
): Promise<HTMLCanvasElement> => {
   return new Promise((resolve, reject) => {
      const svgImg = new window.Image()
      svgImg.onload = () => {
         const canvas = document.createElement('canvas')
         canvas.width = 48
         canvas.height = 72
         const ctx = canvas.getContext('2d')
         if (!ctx) return reject('No ctx')

         ctx.imageSmoothingEnabled = !iconUrl.includes('svg')

         ctx.drawImage(svgImg, 0, 0)
         const iconImg = new window.Image()
         iconImg.onload = () => {
            // Draw the icon centered in a 32x32 box, maintaining aspect ratio
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
         ${markerColor === 'transparent' ? '' : '<circle cx="24" cy="64" r="8" fill="white" />'}
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
