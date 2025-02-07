// Types
import type { Coords } from "@ts/math.types"
import type { Primitives } from "@ts/primitives.types"

// Utils
import { assertExhaustiveGuard } from "./typeguard.helpers"

export const isInsideShape = (targetPos: Coords, primitive: Primitives): boolean | undefined => {
  if (!primitive.pos) return false

  // Necessary deconstruct for the exhaustive switch check
  const { type } = primitive

  switch (type) {
    case "rectangle":
      if (!primitive.width || !primitive.height) return undefined

      return (
        targetPos.x >= primitive.pos.x - primitive.width / 2 &&
        targetPos.x <= primitive.pos.x + primitive.width / 2 &&
        targetPos.y >= primitive.pos.y - primitive.height / 2 &&
        targetPos.y <= primitive.pos.y + primitive.height / 2
      )

    case "circle":
      if (!primitive.radius) return undefined

      const distanceSquared =
        Math.pow(targetPos.x - primitive.pos.x, 2) + Math.pow(targetPos.y - primitive.pos.y, 2)
      const radiusSquared = Math.pow(primitive.radius, 2)

      return distanceSquared <= radiusSquared

    default:
      assertExhaustiveGuard(type)
  }
}
