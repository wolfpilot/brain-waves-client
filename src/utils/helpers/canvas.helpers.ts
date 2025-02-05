// Types
import type { Coords } from "@ts/math.types"
import type { Primitives } from "@ts/primitives.types"

// Utils
import { assertExhaustiveGuard } from "./typeguard.helpers"

// Utils
export const isInsideShape = (pos: Coords, primitive: Primitives): boolean | undefined => {
  if (!primitive.pos) return false

  // Necessary deconstruct for the exhaustive switch check
  const { type } = primitive

  switch (type) {
    case "rectangle":
      if (!primitive.width || !primitive.height) return undefined

      return (
        pos.x >= primitive.pos.x - primitive.width / 2 &&
        pos.x <= primitive.pos.x + primitive.width / 2 &&
        pos.y >= primitive.pos.y - primitive.height / 2 &&
        pos.y <= primitive.pos.y + primitive.height / 2
      )

    case "circle":
      if (!primitive.radius) return undefined

      const distanceSquared =
        Math.pow(pos.x - primitive.pos.x, 2) + Math.pow(pos.y - primitive.pos.y, 2)
      const radiusSquared = Math.pow(primitive.radius, 2)

      return distanceSquared <= radiusSquared

    default:
      assertExhaustiveGuard(type)
  }
}
