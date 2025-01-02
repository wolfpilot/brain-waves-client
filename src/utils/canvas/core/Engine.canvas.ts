// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  private engineStore: EngineStore

  constructor() {
    this.engineStore = useEngineStore()
  }

  private render() {
    this.engineStore.nodes.forEach((node) => node.draw())

    window.requestAnimationFrame(() => this.render())
  }

  public init() {
    this.render()
  }
}

export default EngineImpl
