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

export type RectanglePrimitive = PrimitiveBase & {
  type: "rectangle"
  width: number | null
  height: number | null
  fillColor: string | null
  borderColor: string | null
  borderRadius: number | null
}

class RectanglePrimitiveImpl implements RectanglePrimitive {
  type: "rectangle"
  pos: Coords | null
  width: number
  height: number
  fillColor: string | null
  borderColor: string | null
  borderRadius: number | null
  scaledPos: Coords | null
  scaledWidth: number | null
  scaledHeight: number | null
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor() {
    this.type = "rectangle"
    this.pos = null
    this.width = config.nodes.rectangle.width
    this.height = config.nodes.rectangle.height
    this.fillColor = null
    this.borderColor = null
    this.borderRadius = null
    this.scaledPos = null
    this.scaledWidth = null
    this.scaledHeight = null
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
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

  public draw = () => {
    if (
      !this.#canvasStore.ctx ||
      !this.pos ||
      !this.fillColor ||
      !this.borderColor ||
      !this.borderRadius
    ) {
      return
    }

    this.#canvasStore.ctx.fillStyle = this.fillColor
    this.#canvasStore.ctx.strokeStyle = this.borderColor
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.roundRect(
      this.pos.x - this.width / 2,
      this.pos.y - this.height / 2,
      this.width,
      this.height,
      [this.borderRadius],
    )
    this.#canvasStore.ctx.fill()
    this.#canvasStore.ctx.stroke()
  }

  public updateScale = () => {
    if (!this.pos) return

    this.scaledPos = {
      x: formatToDecimal(this.pos.x * this.#canvasStore.zoomScale),
      y: formatToDecimal(this.pos.y * this.#canvasStore.zoomScale),
    }
    this.scaledWidth = formatToDecimal(this.width * this.#canvasStore.zoomScale)
    this.scaledHeight = formatToDecimal(this.height * this.#canvasStore.zoomScale)
  }

  public updatePosition = () => {
    if (!this.#canvasStore.gridSize || !this.#ioStore.mousePosOffset) {
      return
    }

    const newX =
      // Check if outside left bounds
      this.#ioStore.mousePosOffset.x < (-this.#canvasStore.gridSize.width + this.width) / 2
        ? (-this.#canvasStore.gridSize.width + this.width) / 2
        : // or if outside right bounds
          this.#ioStore.mousePosOffset.x > (this.#canvasStore.gridSize.width - this.width) / 2
          ? (this.#canvasStore.gridSize.width - this.width) / 2
          : this.#ioStore.mousePosOffset.x

    const newY =
      // Check if outside top bounds
      this.#ioStore.mousePosOffset.y < (-this.#canvasStore.gridSize.height + this.height) / 2
        ? (-this.#canvasStore.gridSize.height + this.height) / 2
        : // or if outside bottom bounds
          this.#ioStore.mousePosOffset.y > (this.#canvasStore.gridSize.height - this.height) / 2
          ? (this.#canvasStore.gridSize.height - this.height) / 2
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
        const cssBorderRadius = this.#canvasStore.cssVars.get("--border-radius-default")

        if (!cssFillColor || !cssBorderColor || !cssBorderRadius) return

        this.fillColor = cssFillColor as string
        this.borderColor = cssBorderColor as string
        this.borderRadius = parseInt(cssBorderRadius as string, 10)

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

export default RectanglePrimitiveImpl
