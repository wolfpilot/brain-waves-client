import { ref } from "vue"
import { defineStore } from "pinia"

// Stores
import { useCanvasStore } from "./canvas.stores"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export interface Props {
  ctx: CanvasRenderingContext2D
}

export const useEngineStore = defineStore("engine", () => {
  const canvasStore = useCanvasStore()

  const nodes = ref<CanvasNode[]>([])

  const addRectangle = (): CanvasNode | void => {
    if (!canvasStore.ctx) return

    const node = new CanvasNode({
      ctx: canvasStore.ctx,
      type: "rectangle",
      x: 200,
      y: 200,
    })

    node.init()
    nodes.value.push(node)

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
    nodes.value.push(node)

    return node
  }

  return {
    nodes,
    addRectangle,
    addCircle,
  }
})

export type EngineStore = Omit<
  ReturnType<typeof useEngineStore>,
  keyof ReturnType<typeof defineStore>
>
