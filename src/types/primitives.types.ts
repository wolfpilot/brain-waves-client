// Types
import type { RectanglePrimitive } from "@utils/canvas/primitives/Rectangle.canvas"
import type { CirclePrimitive } from "@utils/canvas/primitives/Circle.canvas"

export interface PrimitiveBaseAPI {
  mode: PrimitiveMode
  type: PrimitiveType
  init: () => void
  draw: () => void
  place: () => void
  updateScale: () => void
  updatePosition: () => void
}

export type Primitives = RectanglePrimitive | CirclePrimitive
export type PrimitiveMode = "preview" | "done"
export type PrimitiveType = "rectangle" | "circle"
