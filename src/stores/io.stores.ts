import { reactive, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords, type Dimensions } from "@ts/math.types"

// Constants
import { type MouseBtnValuesTypes } from "@constants/keys.constants"

export const useIoStore = defineStore("io", () => {
  const state = reactive({
    windowSize: <Dimensions>{
      width: window.innerWidth,
      height: window.innerHeight,
    },
    mousePos: <Coords | null>null,
    wheelOffsetY: <number>0,
    activeMouseButtons: <Map<MouseBtnValuesTypes, boolean>>new Map(),
  })

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
    ...actions,
  }
})

export type IoStore = Omit<ReturnType<typeof useIoStore>, keyof ReturnType<typeof defineStore>>
