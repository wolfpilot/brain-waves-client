import { createSharedComposable } from "@vueuse/core"
import { v4 as uuidv4 } from "uuid"

// Types
import type { PrimitiveType } from "@ts/primitives.types"

// Stores
import { useEngineStore } from "@stores/engine.stores"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

const useEngine = () => {
  const engineStore = useEngineStore()

  // Helpers
  const _handleAddNode = (type: PrimitiveType): CanvasNode | void => {
    const newId = uuidv4()
    const node = new CanvasNode({
      type,
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
    engineStore.setActiveNodeId(null)
  }

  const addRectangle = (): CanvasNode | void => _handleAddNode("rectangle")

  const addCircle = (): CanvasNode | void => _handleAddNode("circle")

  return {
    clearActiveNode,
    addRectangle,
    addCircle,
  }
}

export default createSharedComposable(useEngine)
