// Types
import type { Primitives, PrimitiveType, PrimitiveMode } from "@ts/primitives.types"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"
import { Rectangle, Circle } from "@utils/canvas/primitives"

export interface Props {
  type: PrimitiveType
}

export interface CanvasNode {
  mode: PrimitiveMode
  type: PrimitiveType
  primitive: Primitives
  isHovered: boolean
  init: () => void
  scale: () => void
  draw: () => void
  updateMode: (mode: PrimitiveMode) => void
  updateIsHovered: (val: boolean) => void
}

const generatePrimitive = (type: PrimitiveType): Primitives => {
  switch (type) {
    case "rectangle":
      return new Rectangle()
    case "circle":
      return new Circle()
    default:
      return assertExhaustiveGuard(type)
  }
}

/**
 * Acts as a proxy for common properties and methods of various Primitives
 */
class CanvasNodeImpl implements CanvasNode {
  mode: PrimitiveMode
  type: PrimitiveType
  primitive: Primitives
  isHovered: boolean

  constructor({ type }: Props) {
    this.mode = "preview"
    this.type = type
    this.primitive = generatePrimitive(type)
    this.isHovered = false
  }

  public init() {
    this.#setup()
    this.draw()
  }

  public scale = () => {
    this.primitive.updateScale()
  }

  public draw = () => {
    if (this.mode === "preview") {
      this.primitive.updatePosition()
    }

    this.primitive.draw()
  }

  public updateMode = (mode: PrimitiveMode) => {
    if (mode === "done") {
      this.primitive.place()
    }

    this.mode = mode
  }

  public updateIsHovered = (val: boolean) => {
    if (this.mode === "done") {
      this.primitive.hover(val)
    }

    this.isHovered = val
  }

  #setup = () => {
    this.primitive.init()
  }
}

export default CanvasNodeImpl
