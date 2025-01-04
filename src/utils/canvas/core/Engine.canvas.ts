// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  #engineStore: EngineStore
  #canvasStore: CanvasStore

  constructor() {
    this.#engineStore = useEngineStore()
    this.#canvasStore = useCanvasStore()
  }

  #clear = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.canvasSize) return

    this.#canvasStore.ctx.clearRect(
      0,
      0,
      this.#canvasStore.canvasSize.width,
      this.#canvasStore.canvasSize.height,
    )
  }

  #render = () => {
    this.#clear()

    this.#engineStore.nodes.forEach((node) => node.draw())

    window.requestAnimationFrame(() => this.#render())
  }

  public init = () => {
    this.#render()
  }
}

export default EngineImpl
