// Stores
import { useEngineStore } from "@stores/engine.stores"
import { useCanvasStore } from "@stores/canvas.stores"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export const useEngine = () => {
  const engineStore = useEngineStore()
  const canvasStore = useCanvasStore()

  const addRectangle = (): CanvasNode | void => {
    if (!canvasStore.ctx) return

    const node = new CanvasNode({
      ctx: canvasStore.ctx,
      type: "rectangle",
      x: 200,
      y: 200,
    })

    node.init()
    engineStore.addNode(node)

    return node
  }

  const addCircle = (): CanvasNode | void => {
    if (!canvasStore.ctx) return

    const node = new CanvasNode({
      ctx: canvasStore.ctx,
      type: "circle",
      x: 200,
      y: 200,
    })

    node.init()
    engineStore.addNode(node)

    return node
  }

  return {
    addRectangle,
    addCircle,
  }
}
