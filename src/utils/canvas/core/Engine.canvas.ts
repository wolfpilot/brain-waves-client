import { watch } from "vue"

// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  #engineStore: EngineStore
  #canvasStore: CanvasStore
  #ioStore: IoStore

  constructor() {
    this.#engineStore = useEngineStore()
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()
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

  #scale = () => {
    if (!this.#canvasStore.ctx) return

    this.#canvasStore.ctx.scale(this.#canvasStore.zoomScale, this.#canvasStore.zoomScale)
  }

  #pan = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.viewportPos) return

    this.#canvasStore.ctx.translate(
      -this.#canvasStore.viewportPos.x,
      -this.#canvasStore.viewportPos.y,
    )
  }

  #centre = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.canvasSize) return

    this.#canvasStore.ctx.translate(
      this.#canvasStore.canvasSize.width / 2,
      this.#canvasStore.canvasSize.height / 2,
    )
  }

  #render = () => {
    if (!this.#canvasStore.ctx) return

    this.#clear()

    this.#canvasStore.ctx.save()

    // Apply transforms
    this.#centre()
    this.#pan()
    this.#scale()
    this.#engineStore.nodes.forEach((node) => node.draw())

    this.#canvasStore.ctx.restore()

    window.requestAnimationFrame(this.#render)
  }

  #placeNode = () => {
    if (!this.#engineStore.activeNodeId) return

    const activeNode = this.#engineStore.nodes.get(this.#engineStore.activeNodeId)

    if (!activeNode) return

    activeNode.place()
    this.#engineStore.setActiveNodeId(null)
    this.#canvasStore.resetActiveTool()
  }

  // Handlers
  #handleOnLeftClick = () => {
    switch (this.#canvasStore.activeTool) {
      case "Select":
        break
      case "Rectangle":
      case "Circle":
        this.#placeNode()
        break
      default:
        assertExhaustiveGuard(this.#canvasStore.activeTool)
        break
    }
  }

  #handleOnMouseButtonsChange = (state: IoStore["activeMouseButtons"]) => {
    if (!this.#canvasStore.activeTool) return

    switch (true) {
      case state.get("left"):
        this.#handleOnLeftClick()
        break
      default:
        break
    }
  }

  public init = () => {
    this.#render()

    watch(this.#ioStore.activeMouseButtons, this.#handleOnMouseButtonsChange)
  }
}

export default EngineImpl
