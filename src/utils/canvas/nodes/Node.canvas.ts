// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"

export type NodeType = "rectangle" | "circle"
export type NodeMode = "preview" | "final"

export interface Props {
  ctx: CanvasRenderingContext2D
  type: NodeType
  x: number
  y: number
}

export interface CanvasNode {
  init: () => void
  draw: () => void
}

// Setup
const defaults = {
  rectangle: {
    width: 150,
    height: 50,
  },
  circle: {
    radius: 100,
  },
}

class CanvasNodeImpl implements CanvasNode {
  #canvasStore: CanvasStore
  #ctx: CanvasRenderingContext2D
  #mode: NodeMode
  #type: NodeType
  #x: number
  #y: number
  #fillColor: string | null
  #borderColor: string | null
  #borderRadius: number | null

  constructor({ ctx, type, x, y }: Props) {
    this.#canvasStore = useCanvasStore()
    this.#ctx = ctx
    this.#mode = "preview"
    this.#type = type
    this.#x = x
    this.#y = y
    this.#fillColor = null
    this.#borderColor = null
    this.#borderRadius = null

    if (!this.#canvasStore.cssVars) return

    const cssFillColor = this.#canvasStore.cssVars.get("--c-node-fill")
    const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4")
    const cssBorderRadius = this.#canvasStore.cssVars.get("--border-radius-default")

    if (!cssFillColor || !cssBorderColor || !cssBorderRadius) return

    this.#fillColor = cssFillColor as string
    this.#borderColor = cssBorderColor as string
    this.#borderRadius = parseInt(cssBorderRadius as string, 10)
  }

  #drawRectangle = () => {
    if (!this.#fillColor || !this.#borderColor || !this.#borderRadius) return

    this.#ctx.fillStyle = this.#fillColor
    this.#ctx.strokeStyle = this.#borderColor
    this.#ctx.beginPath()
    this.#ctx.roundRect(this.#x, this.#y, defaults.rectangle.width, defaults.rectangle.height, [
      this.#borderRadius,
    ])
    this.#ctx.fill()
    this.#ctx.stroke()
  }

  #drawCircle = () => {
    if (!this.#fillColor || !this.#borderColor || !this.#borderRadius) return

    this.#ctx.fillStyle = this.#fillColor
    this.#ctx.strokeStyle = this.#borderColor
    this.#ctx.beginPath()
    this.#ctx.arc(this.#x, this.#y, defaults.circle.radius, 0, 2 * Math.PI)
    this.#ctx.fill()
    this.#ctx.stroke()
  }

  public draw = () => {
    switch (this.#type) {
      case "rectangle":
        this.#drawRectangle()
        break
      case "circle":
        this.#drawCircle()
        break
      default:
        assertExhaustiveGuard(this.#type)
    }
  }

  public init() {
    this.draw()
  }
}

export default CanvasNodeImpl
