import { watch, nextTick } from "vue"
import { storeToRefs } from "pinia"

// Types
import type { Coords } from "@ts/math.types"

// Stores
import { type EngineStore, useEngineStore } from "@stores/engine.stores"
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"
import { type GUIStore, useGUIStore } from "@stores/gui.stores"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"
import { isInsideShape } from "@utils/helpers/canvas.helpers"

// Canvas
import { GUI, Debugger } from "@utils/canvas/gui"

export interface Engine {
  init: () => void
}

class EngineImpl implements Engine {
  #engineStore: EngineStore
  #ioStore: IoStore
  #canvasStore: CanvasStore
  #guiStore: GUIStore
  #gui: GUI
  #debugger: Debugger

  constructor() {
    this.#engineStore = useEngineStore()
    this.#ioStore = useIoStore()
    this.#canvasStore = useCanvasStore()
    this.#guiStore = useGUIStore()

    this.#gui = new GUI()
    this.#debugger = new Debugger()
  }

  public init = async () => {
    await Promise.all([this.#gui.init(), this.#debugger.init()])

    this.#bindListeners()
    this.#render()
  }

  #bindListeners = () => {
    const { hoveredNodeId } = storeToRefs(this.#engineStore)
    const { mousePosOffset } = storeToRefs(this.#ioStore)
    const { activeTool, canvasSize, viewportOffset, zoomLevel } = storeToRefs(this.#canvasStore)

    watch(this.#ioStore.activeMouseButtons, this.#handleOnMouseButtonsChange)
    watch(this.#guiStore, this.#handleOnGUIChange)

    watch(mousePosOffset, this.#handleOnMousePosOffsetChange)
    watch(activeTool, this.#handleOnActiveToolChange)
    watch(canvasSize, this.#handleOnCanvasSizeChange)
    watch(viewportOffset, this.#handleOnViewportOffsetChange)
    watch(zoomLevel, this.#handleOnZoomLevelChange)

    watch(hoveredNodeId, this.#handleOnHoveredNodeIdChange)
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
    }
  }

  #handleOnMousePosOffsetChange = (pos: Coords | null) => {
    if (!pos) return

    if (this.#canvasStore.activeTool === "Select") {
      if (!this.#engineStore.nodes.size) return

      /**
       * As multiple shapes may overlap each other, keep track of all being hovered.
       *
       * This will be useful later on when determining which one is the topmost
       * layer in the stack.
       */
      const hoveredIds = []

      for (const [key, value] of this.#engineStore.nodes) {
        if (isInsideShape(pos, value.primitive)) {
          hoveredIds.push(key)
        }
      }

      // Find the latest created ID which is also topmost in the stack
      const hoveredNodeId = hoveredIds[hoveredIds.length - 1]

      this.#engineStore.setHoveredNodeId(hoveredNodeId)
    }

    if (this.#engineStore.activeNodeId) {
      const activeNode = this.#engineStore.nodes.get(this.#engineStore.activeNodeId)

      if (!activeNode) return

      switch (activeNode.mode) {
        case "preview":
          this.#render()
          break
        case "done":
          break
        case "hover":
          break
        default:
          assertExhaustiveGuard(activeNode.mode)
          break
      }
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

  #handleOnHoveredNodeIdChange = (
    state: EngineStore["hoveredNodeId"],
    prevState: EngineStore["hoveredNodeId"],
  ) => {
    // Set old hovered ID to false
    if (prevState) {
      this.#engineStore.nodes.get(prevState)?.updateIsHovered(false)
    }

    // Set currently hovered ID to true
    if (state) {
      this.#engineStore.nodes.get(state)?.updateIsHovered(true)
    }

    this.#render()
  }

  #handleOnGUIChange = () => {
    this.#render()
  }

  #handleOnZoomLevelChange = () => {
    this.#render()
  }

  #handleOnViewportOffsetChange = () => {
    this.#render()
  }

  #handleOnCanvasSizeChange = async () => {
    /**
     * Wait for DOM to update.
     *
     * By default, the watcher side-effects would run as soon as the store is updated,
     * e.g. the Canvas re-renders when the `canvasSize` changes.
     *
     * This results in a concurrency issue since Vue normally updates the Canvas size
     * (width and height) only afterwards, which results in the Canvas clearing and
     * resetting itself after being drawn on.
     *
     * Instead, we wait for the Canvas DOM elem to update first, then run our transforms.
     */
    await nextTick()

    this.#render()
  }

  #placeNode = () => {
    if (!this.#engineStore.activeNodeId) return

    const activeNode = this.#engineStore.nodes.get(this.#engineStore.activeNodeId)

    if (!activeNode) return

    activeNode.updateMode("done")
    this.#engineStore.setHoveredNodeId(this.#engineStore.activeNodeId)
    this.#engineStore.setActiveNodeId(null)
    this.#canvasStore.resetActiveTool()
  }

  #centre = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.canvasSize) return

    this.#canvasStore.ctx.translate(
      this.#canvasStore.canvasSize.width / 2,
      this.#canvasStore.canvasSize.height / 2,
    )
  }

  #pan = () => {
    if (!this.#canvasStore.ctx || !this.#canvasStore.viewportPos) return

    this.#canvasStore.ctx.translate(
      -this.#canvasStore.viewportPos.x,
      -this.#canvasStore.viewportPos.y,
    )
  }

  #scale = () => {
    if (!this.#canvasStore.ctx) return

    this.#canvasStore.ctx.scale(this.#canvasStore.zoomScale, this.#canvasStore.zoomScale)

    this.#engineStore.nodes.forEach((node) => node.scale())
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
}

export default EngineImpl
