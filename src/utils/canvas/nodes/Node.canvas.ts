// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

export interface Props {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
}

export interface CanvasNode {
  draw: () => void
}

// Setup
const defaults = {
  width: 150,
  height: 50,
}

class CanvasNodeImpl implements CanvasNode {
  private canvasStore: CanvasStore
  private ctx: CanvasRenderingContext2D
  private x: number
  private y: number
  private width: number
  private height: number
  private fillColor: string | null
  private borderColor: string | null
  private borderRadius: number | null

  constructor({ ctx, x, y }: Props) {
    this.canvasStore = useCanvasStore()
    this.ctx = ctx
    this.x = x
    this.y = y
    this.width = defaults.width
    this.height = defaults.height
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

    this.init()
  }

  public draw() {
    if (!this.fillColor || !this.borderColor || !this.borderRadius) return

    this.ctx.fillStyle = this.fillColor
    this.ctx.strokeStyle = this.borderColor
    this.ctx.beginPath()
    this.ctx.roundRect(this.x, this.y, this.x + this.width, this.y + this.height, [
      this.borderRadius,
    ])
    this.ctx.fill()
    this.ctx.stroke()
  }

  private init() {
    this.draw()
  }
}

export default CanvasNodeImpl
