import { reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Configs
import { config as debugConfig } from "@configs/debug.config"

export interface Props {
  ctx: CanvasRenderingContext2D
}

// Setup
const { surface, corners, crosshair, centre, quadtree } = debugConfig

export const useGUIStore = defineStore("gui", () => {
  const state = reactive({
    surface,
    corners,
    crosshair,
    centre,
    quadtree,
  })

  const actions = {
    setIsSurfaceEnabled(val: boolean) {
      state.surface = val
    },
    setIsCornersEnabled(val: boolean) {
      state.corners = val
    },
    setIsCrosshairEnabled(val: boolean) {
      state.crosshair = val
    },
    setIsCentreEnabled(val: boolean) {
      state.centre = val
    },
    setIsQuadtreeEnabled(val: boolean) {
      state.quadtree = val
    },
  }

  return {
    ...toRefs(readonly(state)),
    ...actions,
  }
})

export type GUIStore = ReturnType<typeof useGUIStore>
