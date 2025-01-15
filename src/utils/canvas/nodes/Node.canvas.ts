// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Types
import type { Coords } from "@ts/math.types"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"

export type NodeType = "rectangle" | "circle"
export type NodeMode = "preview" | "static"

export interface Props {
  type: NodeType
  pos: Coords
}

export interface CanvasNode {
  init: () => void
  draw: () => void
  scale: () => void
  place: () => void
}

// Setup
const defaults = {
  rectangle: {
    width: 250,
    height: 150,
  },
  circle: {
    radius: 125,
  },
}

class CanvasNodeImpl implements CanvasNode {
  mode: NodeMode
  type: NodeType
  pos: Coords
  fillColor: string | null
  borderColor: string | null
  borderRadius: number | null
  width: number | null
  height: number | null
  radius: number | null
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor({ type, pos }: Props) {
    this.mode = "preview"
    this.type = type
    this.pos = pos
    this.fillColor = null
    this.borderColor = null
    this.borderRadius = null
    this.width = null
    this.height = null
    this.radius = null
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
  }

  #updateRectanglePosition = () => {
    if (
      !this.width ||
      !this.height ||
      !this.#canvasStore.gridSize ||
      !this.#ioStore.mousePosOffset
    ) {
      return
    }

    const unscaledX =
      // Check if outside left bounds
      this.#ioStore.mousePosOffset.x < (-this.#canvasStore.gridSize.width + this.width) / 2
        ? (-this.#canvasStore.gridSize.width + this.width) / 2
        : // or if outside right bounds
          this.#ioStore.mousePosOffset.x > (this.#canvasStore.gridSize.width - this.width) / 2
          ? (this.#canvasStore.gridSize.width - this.width) / 2
          : this.#ioStore.mousePosOffset.x

    const unscaledY =
      // Check if outside top bounds
      this.#ioStore.mousePosOffset.y < (-this.#canvasStore.gridSize.height + this.height) / 2
        ? (-this.#canvasStore.gridSize.height + this.height) / 2
        : // or if outside bottom bounds
          this.#ioStore.mousePosOffset.y > (this.#canvasStore.gridSize.height - this.height) / 2
          ? (this.#canvasStore.gridSize.height - this.height) / 2
          : this.#ioStore.mousePosOffset.y

    const finalX = Math.round(unscaledX / this.#canvasStore.zoomScale)
    const finalY = Math.round(unscaledY / this.#canvasStore.zoomScale)

    this.pos = {
      x: finalX,
      y: finalY,
    }
  }

  #updateCirclePosition = () => {
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

  #updatePosition = () => {
    switch (this.type) {
      case "rectangle":
        this.#updateRectanglePosition()
        break
      case "circle":
        this.#updateCirclePosition()
        break
      default:
        assertExhaustiveGuard(this.type)
    }
  }

  #drawRectangle = () => {
    if (!this.#canvasStore.ctx || !this.fillColor || !this.borderColor || !this.borderRadius) {
      return
    }

    this.#canvasStore.ctx.fillStyle = this.fillColor
    this.#canvasStore.ctx.strokeStyle = this.borderColor
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.roundRect(
      this.pos.x - defaults.rectangle.width / 2,
      this.pos.y - defaults.rectangle.height / 2,
      defaults.rectangle.width,
      defaults.rectangle.height,
      [this.borderRadius],
    )
    this.#canvasStore.ctx.fill()
    this.#canvasStore.ctx.stroke()
  }

  #drawCircle = () => {
    if (!this.#canvasStore.ctx || !this.fillColor || !this.borderColor) {
      return
    }

    this.#canvasStore.ctx.fillStyle = this.fillColor
    this.#canvasStore.ctx.strokeStyle = this.borderColor
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.arc(this.pos.x, this.pos.y, defaults.circle.radius, 0, 2 * Math.PI)
    this.#canvasStore.ctx.fill()
    this.#canvasStore.ctx.stroke()
  }

  #setup = () => {
    if (!this.#canvasStore.cssVars) return

    const cssFillColor = "transparent"
    const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4-60")
    const cssBorderRadius = this.#canvasStore.cssVars.get("--border-radius-default")

    if (!cssFillColor || !cssBorderColor || !cssBorderRadius) return

    this.fillColor = cssFillColor as string
    this.borderColor = cssBorderColor as string
    this.borderRadius = parseInt(cssBorderRadius as string, 10)

    this.scale()
  }

  public place = () => {
    if (!this.#canvasStore.cssVars) return

    const newCssFillColor = this.#canvasStore.cssVars.get("--c-node-fill")
    const newCssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4")

    if (!newCssFillColor || !newCssBorderColor) return

    this.#updatePosition()

    this.fillColor = newCssFillColor as string
    this.borderColor = newCssBorderColor as string
    this.mode = "static"
  }

  public scale = () => {
    this.width =
      this.type === "rectangle"
        ? +(defaults.rectangle.width * this.#canvasStore.zoomScale).toPrecision(3)
        : null
    this.height =
      this.type === "rectangle"
        ? +(defaults.rectangle.height * this.#canvasStore.zoomScale).toPrecision(3)
        : null
    this.radius =
      this.type === "circle"
        ? +(defaults.circle.radius * this.#canvasStore.zoomScale).toPrecision(3)
        : null
  }

  public draw = () => {
    switch (this.mode) {
      case "preview":
        this.#updatePosition()
        break
      case "static":
        break
      default:
        assertExhaustiveGuard(this.mode)
    }

    switch (this.type) {
      case "rectangle":
        this.#drawRectangle()
        break
      case "circle":
        this.#drawCircle()
        break
      default:
        assertExhaustiveGuard(this.type)
    }
  }

  public init() {
    this.#setup()
    this.draw()
  }
}

export default CanvasNodeImpl
