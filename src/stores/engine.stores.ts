import { ref, reactive } from "vue"
import { defineStore } from "pinia"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export interface Props {
  ctx: CanvasRenderingContext2D
}

export const useEngineStore = defineStore("engine", () => {
  const state = reactive({
    nodes: ref<CanvasNode[]>([]),
  })

  const actions = {
    addNode(node: CanvasNode) {
      state.nodes.push(node)
    },
  }

  return {
    ...state,
    ...actions,
  }
})

export type EngineStore = Omit<
  ReturnType<typeof useEngineStore>,
  keyof ReturnType<typeof defineStore>
>
