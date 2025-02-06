// Configs
import { config as canvasConfig } from "@configs/canvas.config"
import { config as debugConfig } from "@configs/debug.config"

// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

export interface Debugger {
  init: () => Promise<void>
  draw: () => void
}

class DebuggerImpl implements Debugger {
  #canvasStore: CanvasStore

  constructor() {
    this.#canvasStore = useCanvasStore()
  }

  public init = () => {
    this.draw()

    return Promise.resolve()
  }

  public draw = () => {
    if (debugConfig.surface) {
      this.#drawSurface()
    }

    if (debugConfig.corners) {
      this.#drawCorners()
    }

    if (debugConfig.crosshair) {
      this.#drawCrosshair()
    }

    if (debugConfig.centre) {
      this.#drawCentre()
    }
  }

  #drawSurface = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssSurfaceColor = this.#canvasStore.cssVars.get("--c-debug-canvas-surface")

    if (!cssSurfaceColor) return

    this.#canvasStore.ctx.fillStyle = cssSurfaceColor as string
    this.#canvasStore.ctx.rect(
      -canvasConfig.grid.width / 2,
      -canvasConfig.grid.height / 2,
      canvasConfig.grid.width,
      canvasConfig.grid.height,
    )
    this.#canvasStore.ctx.fill()
  }

  #drawCorners = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssCornerColor = this.#canvasStore.cssVars.get("--c-debug-canvas-corner")

    if (!cssCornerColor) return

    const offsetX = canvasConfig.grid.width / 2
    const offsetY = canvasConfig.grid.height / 2

    const cornerPositions = [
      // top - left
      {
        x: -offsetX,
        y: -offsetY,
      },
      // top - right
      {
        x: offsetX,
        y: -offsetY,
      },
      // bottom - right
      {
        x: offsetX,
        y: offsetY,
      },
      // bottom - left
      {
        x: -offsetX,
        y: offsetY,
      },
    ]

    for (let i = 0; i < cornerPositions.length; i++) {
      this.#canvasStore.ctx.fillStyle = cssCornerColor as string
      this.#canvasStore.ctx.beginPath()
      this.#canvasStore.ctx.arc(cornerPositions[i].x, cornerPositions[i].y, 20, 0, 2 * Math.PI)
      this.#canvasStore.ctx.fill()
    }
  }

  #drawCrosshair = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssCrosshairColor = this.#canvasStore.cssVars.get("--c-debug-canvas-crosshair")

    if (!cssCrosshairColor) return

    const offsetX = canvasConfig.grid.width / 2
    const offsetY = canvasConfig.grid.height / 2

    // Horizontal axis
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.setLineDash([10, 20])
    this.#canvasStore.ctx.moveTo(-offsetX, 0)
    this.#canvasStore.ctx.lineTo(offsetX, 0)
    this.#canvasStore.ctx.lineWidth = 1
    this.#canvasStore.ctx.strokeStyle = cssCrosshairColor as string
    this.#canvasStore.ctx.stroke()

    // Vertical axis
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.setLineDash([10, 20])
    this.#canvasStore.ctx.moveTo(0, -offsetY)
    this.#canvasStore.ctx.lineTo(0, offsetY)
    this.#canvasStore.ctx.lineWidth = 1
    this.#canvasStore.ctx.strokeStyle = cssCrosshairColor as string
    this.#canvasStore.ctx.stroke()

    // Reset to normal line
    this.#canvasStore.ctx.setLineDash([])
  }

  #drawCentre = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssCentreColor = this.#canvasStore.cssVars.get("--c-debug-canvas-centre")

    if (!cssCentreColor) return

    this.#canvasStore.ctx.fillStyle = cssCentreColor as string
    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.arc(0, 0, 5, 0, 2 * Math.PI)
    this.#canvasStore.ctx.fill()
  }
}

export default DebuggerImpl
