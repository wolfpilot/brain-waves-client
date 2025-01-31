import { reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Configs
import { config as debugConfig } from "@configs/debug.config"

export interface Props {
  ctx: CanvasRenderingContext2D
}

// Setup
const { surface, corners, crosshair, centre } = debugConfig

export const useGUIStore = defineStore("gui", () => {
  const state = reactive({
    surface,
    corners,
    crosshair,
    centre,
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
  }

  return {
    ...toRefs(readonly(state)),
    ...actions,
  }
})

export type GUIStore = ReturnType<typeof useGUIStore>
