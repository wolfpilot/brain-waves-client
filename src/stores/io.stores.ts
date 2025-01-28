import { reactive, computed, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords, type Dimensions } from "@ts/math.types"

// Stores
import { useCanvasStore } from "./canvas.stores"

// Constants
import { type MouseBtnValuesTypes } from "@constants/keys.constants"

export const useIoStore = defineStore("io", () => {
  const canvasStore = useCanvasStore()

  const state = reactive({
    windowSize: <Dimensions>{
      width: window.innerWidth,
      height: window.innerHeight,
    },
    mousePos: <Coords | null>null,
    wheelOffsetY: <number>0,
    activeMouseButtons: <Map<MouseBtnValuesTypes, boolean>>new Map(),
  })

  const getters = {
    /**
     * Translate mouse to Cartesian system coordinates
     */
    mousePosOffset: computed(() => {
      if (
        !state.mousePos ||
        !canvasStore.siteHeaderHeight ||
        !canvasStore.canvasSize ||
        !canvasStore.viewportPos
      ) {
        return null
      }

      return {
        x: state.mousePos.x - canvasStore.canvasSize.width / 2 + canvasStore.viewportPos.x,
        y:
          state.mousePos.y -
          canvasStore.canvasSize.height / 2 +
          canvasStore.viewportPos.y -
          canvasStore.siteHeaderHeight,
      }
    }),
  }

  const actions = {
    setWindowSize(val: Dimensions) {
      state.windowSize = val
    },
    setMousePos(val: Coords) {
      state.mousePos = val
    },
    setWheelOffsetY(val: number) {
      state.wheelOffsetY = val
    },
    setActiveMouseButtons(key: MouseBtnValuesTypes, value: boolean) {
      state.activeMouseButtons.set(key, value)
    },
  }

  return {
    ...toRefs(readonly(state)),
    ...getters,
    ...actions,
  }
})

export type IoStore = ReturnType<typeof useIoStore>
