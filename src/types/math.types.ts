export interface Coords {
  x: number
  y: number
}

export interface Dimensions {
  width: number
  height: number
}

export type Bounds = Coords & Dimensions
