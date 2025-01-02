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
  private canvasStore: CanvasStore
  private ctx: CanvasRenderingContext2D
  private mode: NodeMode
  private type: NodeType
  private x: number
  private y: number
  private fillColor: string | null
  private borderColor: string | null
  private borderRadius: number | null

  constructor({ ctx, type, x, y }: Props) {
    this.canvasStore = useCanvasStore()
    this.ctx = ctx
    this.mode = "preview"
    this.type = type
    this.x = x
    this.y = y
    this.fillColor = null
    this.borderColor = null
    this.borderRadius = null

    if (!this.canvasStore.cssVars) return

    const cssFillColor = this.canvasStore.cssVars.get("--c-node-fill")
    const cssBorderColor = this.canvasStore.cssVars.get("--c-accent-4")
    const cssBorderRadius = this.canvasStore.cssVars.get("--border-radius-default")

    if (!cssFillColor || !cssBorderColor || !cssBorderRadius) return

    this.fillColor = cssFillColor as string
    this.borderColor = cssBorderColor as string
    this.borderRadius = parseInt(cssBorderRadius as string, 10)
  }

  public draw() {
    switch (this.type) {
      case "rectangle":
        this.drawRectangle()
        break
      case "circle":
        this.drawCircle()
        break
      default:
        assertExhaustiveGuard(this.type)
    }
  }

  private drawRectangle() {
    if (!this.fillColor || !this.borderColor || !this.borderRadius) return

    this.ctx.fillStyle = this.fillColor
    this.ctx.strokeStyle = this.borderColor
    this.ctx.beginPath()
    this.ctx.roundRect(
      this.x,
      this.y,
      this.x + defaults.rectangle.width,
      this.y + defaults.rectangle.height,
      [this.borderRadius],
    )
    this.ctx.fill()
    this.ctx.stroke()
  }

  private drawCircle() {
    if (!this.fillColor || !this.borderColor || !this.borderRadius) return

    this.ctx.fillStyle = this.fillColor
    this.ctx.strokeStyle = this.borderColor
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, defaults.circle.radius, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.stroke()
  }

  public init() {
    this.draw()
  }
}

export default CanvasNodeImpl
