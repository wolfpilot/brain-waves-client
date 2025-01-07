import { watch } from "vue"
import { createSharedComposable } from "@vueuse/core"

// Types
import type { NodeType } from "@utils/canvas/nodes/Node.canvas"

// Stores
import { useEngineStore } from "@stores/engine.stores"
import { useCanvasStore } from "@stores/canvas.stores"
import { useIoStore, type IoStore } from "@stores/io.stores"

// Utils
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"
import { CanvasNode } from "@utils/canvas/nodes"

const useEngine = () => {
  const engineStore = useEngineStore()
  const canvasStore = useCanvasStore()
  const ioStore = useIoStore()

  // Helpers
  const _addNode = (type: NodeType): CanvasNode | void => {
    if (!ioStore.mousePos) return

    const node = new CanvasNode({
      type,
      pos: {
        x: ioStore.mousePos.x,
        y: ioStore.mousePos.y,
      },
    })

    node.init()
    engineStore.addNode(node)
    engineStore.setActiveNodeIndex(engineStore.nodes.length - 1)

    return node
  }

  const _placeNode = () => {
    if (engineStore.activeNodeIndex === null) return

    engineStore.nodes[engineStore.activeNodeIndex].place()
    engineStore.setActiveNodeIndex(null)
    canvasStore.resetActiveTool()
  }

  // API
  const addRectangle = (): CanvasNode | void => _addNode("rectangle")

  const addCircle = (): CanvasNode | void => _addNode("circle")

  // Handlers
  const handleOnLeftClick = () => {
    switch (canvasStore.activeTool) {
      case "Select":
        break
      case "Rectangle":
      case "Circle":
        _placeNode()
        break
      default:
        assertExhaustiveGuard(canvasStore.activeTool)
        break
    }
  }

  const handleOnClick = (state: IoStore["activeMouseButtons"]) => {
    if (!canvasStore.activeTool) return

    switch (true) {
      case state.get("left"):
        handleOnLeftClick()
        break
      default:
        break
    }
  }

  watch(ioStore.activeMouseButtons, handleOnClick)

  return {
    addRectangle,
    addCircle,
  }
}

export default createSharedComposable(useEngine)
