import { createSharedComposable } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

// Types
import type { NodeType } from "@utils/canvas/nodes/Node.canvas"

// Stores
import { useEngineStore } from "@stores/engine.stores"
import { useIoStore } from "@stores/io.stores"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

const useEngine = () => {
  const engineStore = useEngineStore()
  const ioStore = useIoStore()

  // Helpers
  const _addNode = (type: NodeType): CanvasNode | void => {
    if (!ioStore.mousePos) return

    const newId = uuidv4()
    const node = new CanvasNode({
      type,
      pos: {
        x: ioStore.mousePos.x,
        y: ioStore.mousePos.y,
      },
    })

    node.init()
    engineStore.addNode(newId, node)
    engineStore.setActiveNodeId(newId)

    return node
  }

  // API
  const clearActiveNode = () => {
    if (!engineStore.activeNodeId) return

    engineStore.removeNode(engineStore.activeNodeId)
  }

  const addRectangle = (): CanvasNode | void => _addNode("rectangle")

  const addCircle = (): CanvasNode | void => _addNode("circle")

  return {
    clearActiveNode,
    addRectangle,
    addCircle,
  }
}

export default createSharedComposable(useEngine)
