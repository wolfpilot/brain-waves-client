import { ref, reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export interface Props {
  ctx: CanvasRenderingContext2D
}

export const useEngineStore = defineStore("engine", () => {
  const state = reactive({
    nodes: new Map<string, CanvasNode>(),
    activeNodeId: ref<string | null>(null),
  })

  const actions = {
    addNode(id: string, node: CanvasNode) {
      state.nodes.set(id, node)
    },
    removeNode(id: string) {
      state.nodes.delete(id)
    },
    setActiveNodeId(val: string | null) {
      state.activeNodeId = val
    },
  }

  return {
    ...toRefs(readonly(state)),
    ...actions,
  }
})

export type EngineStore = ReturnType<typeof useEngineStore>
