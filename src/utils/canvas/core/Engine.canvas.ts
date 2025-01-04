// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  private engineStore: EngineStore
  private canvasStore: CanvasStore

  constructor() {
    this.engineStore = useEngineStore()
    this.canvasStore = useCanvasStore()
  }

  private _clear() {
    if (!this.canvasStore.ctx || !this.canvasStore.canvasSize) return

    this.canvasStore.ctx.clearRect(
      0,
      0,
      this.canvasStore.canvasSize.width,
      this.canvasStore.canvasSize.height,
    )
  }

  private _render() {
    this._clear()

    this.engineStore.nodes.forEach((node) => node.draw())

    window.requestAnimationFrame(() => this._render())
  }

  public init() {
    this._render()
  }
}

export default EngineImpl
