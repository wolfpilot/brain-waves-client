import { watch } from "vue"
import { storeToRefs } from "pinia"

// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"

// Canvas
import { GUI, Debugger } from "@utils/canvas/gui"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  #engineStore: EngineStore
  #canvasStore: CanvasStore
  #ioStore: IoStore
  #gui: GUI
  #debugger: Debugger

  constructor() {
    this.#engineStore = useEngineStore()
    this.#canvasStore = useCanvasStore()
    this.#ioStore = useIoStore()

    this.#gui = new GUI()
    this.#debugger = new Debugger()
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

    this.#engineStore.nodes.forEach((node) => node.scale())
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

    this.#debugger.draw()

    this.#engineStore.nodes.forEach((node) => node.draw())

    this.#canvasStore.ctx.restore()
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
        this.#render()
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

  #handleOnMousePosOffsetChange = () => {
    if (!this.#engineStore.activeNodeId) return

    const activeNode = this.#engineStore.nodes.get(this.#engineStore.activeNodeId)

    if (!activeNode) return

    switch (activeNode.primitive.mode) {
      case "preview":
        this.#render()
        break
      case "done":
        break
      default:
        assertExhaustiveGuard(activeNode.primitive.mode)
        break
    }
  }

  #handleOnActiveToolChange = () => {
    switch (this.#canvasStore.activeTool) {
      case "Select":
        this.#render()
        break
      case "Rectangle":
      case "Circle":
        break
      default:
        assertExhaustiveGuard(this.#canvasStore.activeTool)
        break
    }
  }

  #handleOnViewportOffsetChange = () => {
    this.#render()
  }

  #handleOnZoomLevelChange = () => {
    this.#render()
  }

  #bindListeners = () => {
    const { mousePosOffset } = storeToRefs(this.#ioStore)
    const { activeTool, canvasSize, viewportOffset, zoomLevel } = storeToRefs(this.#canvasStore)

    watch(this.#ioStore.activeMouseButtons, this.#handleOnMouseButtonsChange)

    watch(mousePosOffset, this.#handleOnMousePosOffsetChange)
    watch(activeTool, this.#handleOnActiveToolChange)
    watch(canvasSize, this.#handleOnCanvasSizeChange)
    watch(viewportOffset, this.#handleOnViewportOffsetChange)
    watch(zoomLevel, this.#handleOnZoomLevelChange)
  }

  public init = async () => {
    await Promise.all([this.#gui.init(), this.#debugger.init()])

    this.#bindListeners()
    this.#render()
  }
}

export default EngineImpl
