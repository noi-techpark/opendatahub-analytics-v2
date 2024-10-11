export type DataPoint = {
  scode: string
  scoordinate: {
    x: number
    y: number
    srid: number
  }
  stype: string
}

export type FlatResponse = {
  offset: number
  data: DataPoint[]
  limit: number
}
