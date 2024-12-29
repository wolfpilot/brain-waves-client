// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  private canvasStore: CanvasStore

  constructor() {
    this.canvasStore = useCanvasStore()
  }

  private render() {
    this.canvasStore.nodes.forEach((node) => node.draw())

    window.requestAnimationFrame(() => this.render())
  }

  public init() {
    this.render()
  }
}

export default EngineImpl
