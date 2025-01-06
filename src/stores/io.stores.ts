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
    mousePosOffset: computed(() => {
      if (!state.mousePos || !canvasStore.siteHeaderHeight) return null

      return {
        x: state.mousePos.x,
        y: state.mousePos.y - canvasStore.siteHeaderHeight,
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

export type IoStore = Omit<ReturnType<typeof useIoStore>, keyof ReturnType<typeof defineStore>>
