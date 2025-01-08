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
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor({ type, pos }: Props) {
    this.mode = "preview"
    this.type = type
    this.pos = pos
    this.fillColor = null
    this.borderColor = null
    this.borderRadius = null
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
  }

  #updatePosition = () => {
    if (!this.#ioStore.mousePosOffset || !this.#canvasStore.viewportOffset) {
      return
    }

    switch (this.type) {
      case "rectangle":
        this.pos = {
          x:
            this.#ioStore.mousePosOffset.x -
            defaults.rectangle.width / 2 -
            this.#canvasStore.viewportOffset.x,
          y:
            this.#ioStore.mousePosOffset.y -
            defaults.rectangle.height / 2 -
            this.#canvasStore.viewportOffset.y,
        }
        break
      case "circle":
        this.pos = {
          x: this.#ioStore.mousePosOffset.x - this.#canvasStore.viewportOffset.x,
          y: this.#ioStore.mousePosOffset.y - this.#canvasStore.viewportOffset.y,
        }
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
      this.pos.x,
      this.pos.y,
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

  #setup() {
    if (!this.#canvasStore.cssVars) return

    const cssFillColor = "transparent"
    const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4-60")
    const cssBorderRadius = this.#canvasStore.cssVars.get("--border-radius-default")

    if (!cssFillColor || !cssBorderColor || !cssBorderRadius) return

    this.fillColor = cssFillColor as string
    this.borderColor = cssBorderColor as string
    this.borderRadius = parseInt(cssBorderRadius as string, 10)
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
