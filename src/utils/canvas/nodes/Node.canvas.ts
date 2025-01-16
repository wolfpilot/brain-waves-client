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

class CanvasNodeImpl implements CanvasNode {
  mode: PrimitiveMode
  type: PrimitiveType
  primitive: Primitives | null

  constructor({ type }: Props) {
    this.mode = "preview"
    this.type = type
    this.primitive = null
  }

  #setup = () => {
    switch (this.type) {
      case "rectangle":
        this.primitive = new Rectangle()
        break
      case "circle":
        this.primitive = new Circle()
        break
      default:
        assertExhaustiveGuard(this.type)
    }

    this.primitive?.init()
  }

  public place = () => {
    if (!this.primitive) return

    this.primitive.place()
  }

  public scale = () => {
    if (!this.primitive) return

    this.primitive.updateScale()
  }

  public draw = () => {
    if (!this.primitive) return

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
