// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Types
import type { Coords } from "@ts/math.types"
import type { PrimitiveBaseAPI, PrimitiveMode, PrimitiveType } from "@ts/primitives.types"

// Configs
import { config } from "@configs/canvas.config"

export type CirclePrimitive = PrimitiveBaseAPI

class CirclePrimitiveImpl implements CirclePrimitive {
  mode: PrimitiveMode
  type: PrimitiveType
  pos: Coords | null
  radius: number | null
  fillColor: string | null
  borderColor: string | null
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor() {
    this.mode = "preview"
    this.type = "circle"
    this.pos = null
    this.radius = null
    this.fillColor = null
    this.borderColor = null
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
  }

  #setup = () => {
    if (!this.#canvasStore.cssVars) return

    const cssFillColor = "transparent"
    const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4-60")

    if (!cssFillColor || !cssBorderColor) return

    this.fillColor = cssFillColor as string
    this.borderColor = cssBorderColor as string

    this.updateScale()
  }

  public place = () => {
    if (!this.#canvasStore.cssVars) return

    const newCssFillColor = this.#canvasStore.cssVars.get("--c-node-fill")
    const newCssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4")

    if (!newCssFillColor || !newCssBorderColor) return

    this.fillColor = newCssFillColor as string
    this.borderColor = newCssBorderColor as string
    this.mode = "done"
  }

  public draw = () => {
    if (!this.#canvasStore.ctx || !this.pos || !this.fillColor || !this.borderColor) {
      return
    }

    this.#canvasStore.ctx.fillStyle = this.fillColor
    this.#canvasStore.ctx.strokeStyle = this.borderColor
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.arc(this.pos.x, this.pos.y, config.nodes.circle.radius, 0, 2 * Math.PI)
    this.#canvasStore.ctx.fill()
    this.#canvasStore.ctx.stroke()
  }

  public updateScale = () => {
    this.radius = +(config.nodes.circle.radius * this.#canvasStore.zoomScale).toPrecision(3)
  }

  public updatePosition = () => {
    if (!this.radius || !this.#canvasStore.gridSize || !this.#ioStore.mousePosOffset) {
      return
    }

    const unscaledX =
      // Check if outside left bounds
      this.#ioStore.mousePosOffset.x < -this.#canvasStore.gridSize.width / 2 + this.radius
        ? -this.#canvasStore.gridSize.width / 2 + this.radius
        : // or if outside right bounds
          this.#ioStore.mousePosOffset.x > this.#canvasStore.gridSize.width / 2 - this.radius
          ? this.#canvasStore.gridSize.width / 2 - this.radius
          : this.#ioStore.mousePosOffset.x

    const unscaledY =
      // Check if outside top bounds
      this.#ioStore.mousePosOffset.y < -this.#canvasStore.gridSize.height / 2 + this.radius
        ? -this.#canvasStore.gridSize.height / 2 + this.radius
        : // or if outside bottom bounds
          this.#ioStore.mousePosOffset.y > this.#canvasStore.gridSize.height / 2 - this.radius
          ? this.#canvasStore.gridSize.height / 2 - this.radius
          : this.#ioStore.mousePosOffset.y

    const finalX = Math.round(unscaledX / this.#canvasStore.zoomScale)
    const finalY = Math.round(unscaledY / this.#canvasStore.zoomScale)

    this.pos = {
      x: finalX,
      y: finalY,
    }
  }

  public init() {
    this.#setup()
    this.draw()
  }
}

export default CirclePrimitiveImpl
