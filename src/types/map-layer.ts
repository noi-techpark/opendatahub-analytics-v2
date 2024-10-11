export type MapLayer = {
  id: string
  layers: Layer[]
}[]

export type Layer = {
  id: string
  icons: (string | [string, string, number, number, number])[]
  stationType: string[]
  projection: string
  apiWhere?: string
  format: string
  'custom-function': any | null
  color: string
  'main-data': [string, any][]
  imageMapping?: {
    dataType: string
    dataTypeMetadata: string
    valueSeparator: string
    metaDataImgData: string
  }
}
