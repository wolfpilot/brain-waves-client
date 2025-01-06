import { ref, reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export interface Props {
  ctx: CanvasRenderingContext2D
}

export const useEngineStore = defineStore("engine", () => {
  const state = reactive({
    nodes: ref<CanvasNode[]>([]),
    activeNodeIndex: ref<number | null>(null),
  })

  const actions = {
    addNode(node: CanvasNode) {
      state.nodes.push(node)
    },
    setActiveNodeIndex(val: number | null) {
      state.activeNodeIndex = val
    },
  }

  return {
    ...toRefs(readonly(state)),
    ...actions,
  }
})

export type EngineStore = Omit<
  ReturnType<typeof useEngineStore>,
  keyof ReturnType<typeof defineStore>
>
