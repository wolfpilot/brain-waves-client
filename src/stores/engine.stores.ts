import { reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"
import { QuadTree } from "@utils/canvas/layout"

export interface Props {
  ctx: CanvasRenderingContext2D
}

export const useEngineStore = defineStore("engine", () => {
  const state = reactive({
    nodes: new Map<string, CanvasNode>(),
    activeNodeId: <string | null>null,
    hoveredNodeId: <string | null>null,
    quadtree: new QuadTree({
      x: 0,
      y: 0,
      width: canvasConfig.grid.width,
      height: canvasConfig.grid.height,
    }),
  })

  const actions = {
    addNode(id: string, node: CanvasNode) {
      state.nodes.set(id, node)
    },
    removeNode(id: string) {
      state.nodes.delete(id)
    },
    setHoveredNodeId(val: string | null) {
      state.hoveredNodeId = val
    },
    setActiveNodeId(val: string | null) {
      state.activeNodeId = val
    },
    addQuadTreeNode(id: string, node: CanvasNode) {
      state.quadtree.add(id, node)
    },
  }

  return {
    ...toRefs(readonly(state)),
    ...actions,
  }
})

export type EngineStore = ReturnType<typeof useEngineStore>
