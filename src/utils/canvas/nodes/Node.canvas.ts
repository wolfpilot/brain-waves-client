// Types
import type { Primitives, PrimitiveType, PrimitiveMode } from "@ts/primitives.types"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"
import { Rectangle, Circle } from "@utils/canvas/primitives"

export interface Props {
  type: PrimitiveType
}

export interface CanvasNode {
  init: () => void
  draw: () => void
  scale: () => void
  place: () => void
}

const getPrimitive = (type: PrimitiveType): Primitives => {
  switch (type) {
    case "rectangle":
      return new Rectangle()
    case "circle":
      return new Circle()
    default:
      return assertExhaustiveGuard(type)
  }
}

class CanvasNodeImpl implements CanvasNode {
  mode: PrimitiveMode
  type: PrimitiveType
  primitive: Primitives

  constructor({ type }: Props) {
    this.mode = "preview"
    this.type = type
    this.primitive = getPrimitive(type)
  }

  #setup = () => {
    this.primitive.init()
  }

  public place = () => {
    this.primitive.place()
  }

  public scale = () => {
    this.primitive.updateScale()
  }

  public draw = () => {
    if (this.primitive.mode === "preview") {
      this.primitive.updatePosition()
    }

    this.primitive.draw()
  }

  public init() {
    this.#setup()
    this.draw()
  }
}

export default CanvasNodeImpl
