// Types
import type { Coords } from "@ts/math.types"
import type { Primitives } from "@ts/primitives.types"

// Utils
import { assertExhaustiveGuard } from "./typeguard.helpers"

export const isInsideShape = (
  pos: Coords,
  primitive: Primitives,
  scale: number,
): boolean | undefined => {
  if (!primitive.pos) return false

  // Necessary deconstruct for the exhaustive switch check
  const { type } = primitive

  const scaledPrimitivePos = {
    x: primitive.pos.x * scale,
    y: primitive.pos.y * scale,
  }

  switch (type) {
    case "rectangle":
      if (!primitive.width || !primitive.height) return undefined

      return (
        pos.x >= scaledPrimitivePos.x - primitive.width / 2 &&
        pos.x <= scaledPrimitivePos.x + primitive.width / 2 &&
        pos.y >= scaledPrimitivePos.y - primitive.height / 2 &&
        pos.y <= scaledPrimitivePos.y + primitive.height / 2
      )

    case "circle":
      if (!primitive.radius) return undefined

      const distanceSquared =
        Math.pow(pos.x - scaledPrimitivePos.x, 2) + Math.pow(pos.y - scaledPrimitivePos.y, 2)
      const radiusSquared = Math.pow(primitive.radius, 2)

      return distanceSquared <= radiusSquared

    default:
      assertExhaustiveGuard(type)
  }
}
