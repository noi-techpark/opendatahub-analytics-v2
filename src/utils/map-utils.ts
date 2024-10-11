import { DataPoint } from '../types/api.js'
import { AddLayerObject, Map, SourceSpecification } from 'maplibre-gl'

export const createPointSource = (point: DataPoint): SourceSpecification => ({
  type: 'geojson',
  data: {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.scoordinate.x, point.scoordinate.y],
    },
    properties: {},
  },
})

export const createPointLayer = (point: DataPoint): AddLayerObject => ({
  id: `point-layer-${point.scode}`,
  source: `point-source-${point.scode}`,
  type: 'symbol',
  layout: {
    'text-field': point.scode,
    'text-font': ['Open Sans Bold'],
    'text-radial-offset': 1.5,
    'text-size': 16,
    'text-max-width': 10,
    'text-justify': 'auto',
    'text-anchor': 'left',
    'text-allow-overlap': true,
    'icon-allow-overlap': true,
    'icon-size': 0.3,
    'text-variable-anchor': ['left', 'right'],
  },
  paint: {
    'text-color': '#FFBD00',
    'text-halo-width': 2,
    'text-halo-color': 'black',
  },
})

export const initMap = () => {
  return new Map({
    container: 'map',

    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution:
            '<a target="_blank" href="http://www.opendatahub.com">OpenDataHub.com</a> | Map tiles by <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a>',
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
      glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    },
    center: [11.3295, 46.4896],
    zoom: 13,
    maxZoom: 18,
  })
}
