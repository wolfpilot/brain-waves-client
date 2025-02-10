import { reactive, computed, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords, type Dimensions } from "@ts/math.types"

// Stores
import { useCanvasStore } from "./canvas.stores"

// Constants
import { type MouseBtnValuesTypes } from "@constants/keys.constants"

// Utils
import { formatToDecimal } from "@utils/helpers/math.helpers"

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

  /**
   * Contrary to Canvas elements, the mouse position is scaled automatically due to
   * calculations relative to already scaled elements.
   *
   * To get the original, unscaled position we divide by the current zoom scale.
   */
  const mousePosOffset = computed(() => {
    if (!scaledMousePosOffset.value) return null

    return {
      x: formatToDecimal(scaledMousePosOffset.value.x / canvasStore.zoomScale),
      y: formatToDecimal(scaledMousePosOffset.value.y / canvasStore.zoomScale),
    }
  })

  /**
   * Translate mouse to Cartesian system coordinates
   */
  const scaledMousePosOffset = computed<Coords | null>(() => {
    if (
      !state.mousePos ||
      !canvasStore.siteHeaderHeight ||
      !canvasStore.canvasSize ||
      !canvasStore.viewportPos
    ) {
      return null
    }

    return {
      x: formatToDecimal(
        state.mousePos.x - canvasStore.canvasSize.width / 2 + canvasStore.viewportPos.x,
      ),
      y: formatToDecimal(
        state.mousePos.y -
          canvasStore.canvasSize.height / 2 +
          canvasStore.viewportPos.y -
          canvasStore.siteHeaderHeight,
      ),
    }
  })

  const getters = {
    scaledMousePosOffset,
    mousePosOffset,
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
