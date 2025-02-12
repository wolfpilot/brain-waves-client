// Types
import { QuadTree } from "@utils/canvas/layout"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"
import { config as debugConfig } from "@configs/debug.config"

// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type EngineStore, useEngineStore } from "@stores/engine.stores"

export interface Debugger {
  init: () => Promise<void>
  draw: () => void
}

class DebuggerImpl implements Debugger {
  #canvasStore: CanvasStore
  #engineStore: EngineStore

  constructor() {
    this.#canvasStore = useCanvasStore()
    this.#engineStore = useEngineStore()
  }

  public init = () => {
    this.draw()

    return Promise.resolve()
  }

  public draw = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDebugEnabled = urlParams.get("debug")

    // Delay initialisation until we confirm the debug is actually needed
    if (isDebugEnabled !== "true") return

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

    if (debugConfig.quadtree) {
      this.#drawQuadTree()
    }
  }

  #drawSurface = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssSurfaceColor = this.#canvasStore.cssVars.get("--c-debug-canvas-surface")

    if (!cssSurfaceColor) return

    this.#canvasStore.ctx.beginPath()
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
      this.#canvasStore.ctx.beginPath()
      this.#canvasStore.ctx.fillStyle = cssCornerColor as string
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

    this.#canvasStore.ctx.beginPath()
    this.#canvasStore.ctx.fillStyle = cssCentreColor as string
    this.#canvasStore.ctx.arc(0, 0, 5, 0, 2 * Math.PI)
    this.#canvasStore.ctx.fill()
  }

  #drawQuadTree = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.cssVars) return

    const cssQuadtreeColor = this.#canvasStore.cssVars.get("--c-debug-canvas-quadtree")
    const cssQuadtreeBorderColor = this.#canvasStore.cssVars.get("--c-debug-canvas-quadtree-border")

    if (!cssQuadtreeColor) return

    const ctx = this.#canvasStore.ctx

    const drawSubdivision = (tree: QuadTree) => {
      ctx.fillStyle = cssQuadtreeColor as string
      ctx.strokeStyle = cssQuadtreeBorderColor as string

      const { x, y, width, height } = tree.bounds

      ctx.beginPath()
      ctx.rect(x - width / 2, y - height / 2, width, height)
      ctx.fill()
      ctx.stroke()

      for (let i = 0; i < tree.quadrants.length; i++) {
        drawSubdivision(tree.quadrants[i] as QuadTree)
      }
    }

    drawSubdivision(this.#engineStore.quadtree as QuadTree)
  }
}

export default DebuggerImpl
