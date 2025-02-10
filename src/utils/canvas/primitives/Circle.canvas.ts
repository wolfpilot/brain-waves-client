// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Types
import type { Coords } from "@ts/math.types"
import type { PrimitiveBase, PrimitiveMode } from "@ts/primitives.types"

// Configs
import { config } from "@configs/canvas.config"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"
import { formatToDecimal } from "@utils/helpers/math.helpers"

export type CirclePrimitive = PrimitiveBase & {
  type: "circle"
  radius: number | null
  fillColor: string | null
  borderColor: string | null
}

class CirclePrimitiveImpl implements CirclePrimitive {
  type: "circle"
  pos: Coords | null
  radius: number
  fillColor: string | null
  borderColor: string | null
  scaledPos: Coords | null
  scaledRadius: number | null
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor() {
    this.type = "circle"
    this.pos = null
    this.radius = config.nodes.circle.radius
    this.fillColor = null
    this.borderColor = null
    this.scaledPos = null
    this.scaledRadius = null
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
  }

  public draw = () => {
    if (!this.#canvasStore.ctx || !this.pos || !this.fillColor || !this.borderColor) {
      return
    }

    this.#canvasStore.ctx.fillStyle = this.fillColor
    this.#canvasStore.ctx.strokeStyle = this.borderColor
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI)
    this.#canvasStore.ctx.fill()
    this.#canvasStore.ctx.stroke()
  }

  public init() {
    this.#setup()
    this.draw()
  }

  public place = () => {
    this.#updateStyles("done")
  }

  public hover = (val: boolean) => {
    this.#updateStyles(val ? "hover" : "done")
  }

  public updateScale = () => {
    if (!this.pos) return

    this.scaledPos = {
      x: formatToDecimal(this.pos.x * this.#canvasStore.zoomScale),
      y: formatToDecimal(this.pos.y * this.#canvasStore.zoomScale),
    }
    this.scaledRadius = formatToDecimal(config.nodes.circle.radius * this.#canvasStore.zoomScale)
  }

  public updatePosition = () => {
    if (!this.#canvasStore.gridSize || !this.#ioStore.mousePosOffset) {
      return
    }

    const newX =
      // Check if outside left bounds
      this.#ioStore.mousePosOffset.x < -this.#canvasStore.gridSize.width / 2 + this.radius
        ? -this.#canvasStore.gridSize.width / 2 + this.radius
        : // or if outside right bounds
          this.#ioStore.mousePosOffset.x > this.#canvasStore.gridSize.width / 2 - this.radius
          ? this.#canvasStore.gridSize.width / 2 - this.radius
          : this.#ioStore.mousePosOffset.x

    const newY =
      // Check if outside top bounds
      this.#ioStore.mousePosOffset.y < -this.#canvasStore.gridSize.height / 2 + this.radius
        ? -this.#canvasStore.gridSize.height / 2 + this.radius
        : // or if outside bottom bounds
          this.#ioStore.mousePosOffset.y > this.#canvasStore.gridSize.height / 2 - this.radius
          ? this.#canvasStore.gridSize.height / 2 - this.radius
          : this.#ioStore.mousePosOffset.y

    this.pos = {
      x: newX,
      y: newY,
    }
  }

  #setup = () => {
    this.#updateStyles("preview")
    this.updateScale()
  }

  #updateStyles = (mode: PrimitiveMode) => {
    if (!this.#canvasStore.cssVars) return

    switch (mode) {
      case "preview": {
        const cssFillColor = "transparent"
        const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4-60")

        if (!cssFillColor || !cssBorderColor) return

        this.fillColor = cssFillColor as string
        this.borderColor = cssBorderColor as string

        break
      }
      case "done": {
        const cssFillColor = this.#canvasStore.cssVars.get("--c-node-fill")
        const cssBorderColor = this.#canvasStore.cssVars.get("--c-accent-4")

        if (!cssFillColor || !cssBorderColor) return

        this.fillColor = cssFillColor as string
        this.borderColor = cssBorderColor as string

        break
      }
      case "hover": {
        const cssFillColor = this.#canvasStore.cssVars.get("--c-node-hover-fill")

        if (!cssFillColor) return

        this.fillColor = cssFillColor as string

        break
      }
      default:
        assertExhaustiveGuard(mode)
    }
  }
}

export default CirclePrimitiveImpl
