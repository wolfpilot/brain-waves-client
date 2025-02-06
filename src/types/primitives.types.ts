// Types
import type { Coords } from "@ts/math.types"
import type { RectanglePrimitive } from "@utils/canvas/primitives/Rectangle.canvas"
import type { CirclePrimitive } from "@utils/canvas/primitives/Circle.canvas"

export interface PrimitiveBase {
  type: PrimitiveType
  pos: Coords | null
  init: () => void
  place: () => void
  hover: (val: boolean) => void
  draw: () => void
  updateScale: () => void
  updatePosition: () => void
}

export type Primitives = RectanglePrimitive | CirclePrimitive
export type PrimitiveMode = "preview" | "done" | "hover"
export type PrimitiveType = "rectangle" | "circle"
