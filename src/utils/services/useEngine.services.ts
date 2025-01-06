// Types
import type { NodeType } from "@utils/canvas/nodes/Node.canvas"

// Stores
import { useEngineStore } from "@stores/engine.stores"
import { useIoStore } from "@stores/io.stores"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export const useEngine = () => {
  const engineStore = useEngineStore()
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

    return node
  }

  // API
  const addRectangle = (): CanvasNode | void => _addNode("rectangle")

  const addCircle = (): CanvasNode | void => _addNode("circle")

  return {
    addRectangle,
    addCircle,
  }
}
