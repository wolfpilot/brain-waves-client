import { ref, reactive, computed, readonly, toRefs } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords, type Dimensions } from "@ts/math.types"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Constants
import { type ToolValueTypes, TOOLBAR_TOOLS } from "@constants/toolbar.constants"

/**
 * Create a store with state as read-only values, updatable via actions
 *
 * @see https://github.com/vuejs/pinia/issues/58
 */
export const useCanvasStore = defineStore("canvas", () => {
  // Context cannot be read-only, but this is a good way to share it across consumers
  const ctx = ref<CanvasRenderingContext2D | null>(null)

  const state = reactive({
    cssVars: <Map<string, CSSUnparsedSegment> | null>null,
    canvasSize: <Dimensions | null>null,
    gridSize: <Dimensions | null>null,
    viewportPos: <Coords | null>null,
    zoomLevel: <number>canvasConfig.zoom.level,
    zoomScale: <number>canvasConfig.zoom.factor,
    activeTool: <ToolValueTypes>TOOLBAR_TOOLS.select,
  })

  // Getters
  /**
   * The amount the centre has to be translated to make it relative
   * to the middle of the grid, rather than top-left.
   */
  const centreOffset = computed(() => {
    if (!state.gridSize) return null

    return {
      x: state.gridSize.width / 2,
      y: state.gridSize.height / 2,
    }
  })

  /**
   * The amount the viewport needs to be translated to see the correct
   * area of the canvas.
   *
   * To explain the inverse calculation, first understant that:
   *
   * - When we want to look to the right, we need to slide everything to the left.
   * - When we want to look to the left, we need to slide everything to the right.
   */
  const viewportOffset = computed(() => {
    if (!centreOffset.value || !state.viewportPos) {
      return {
        x: 0,
        y: 0,
      }
    }

    return {
      x: -(state.viewportPos.x + centreOffset.value.x),
      y: -(state.viewportPos.y + centreOffset.value.y),
    }
  })

  const siteHeaderHeight = computed(() => {
    if (!state.cssVars) return null

    const cssSiteHeaderHeight = state.cssVars.get("--size-siteHeaderHeight") as string

    return parseInt(cssSiteHeaderHeight, 10)
  })

  const siteFooterHeight = computed(() => {
    if (!state.cssVars) return null

    const cssSiteFooterHeight = state.cssVars.get("--size-siteFooterHeight") as string

    return parseInt(cssSiteFooterHeight, 10)
  })

  const getters = {
    centreOffset,
    viewportOffset,
    siteHeaderHeight,
    siteFooterHeight,
  }

  const actions = {
    setContext(val: CanvasRenderingContext2D) {
      ctx.value = val
    },
    setCssVars(val: Map<string, CSSUnparsedSegment>) {
      state.cssVars = val
    },
    setCanvasSize(val: Dimensions) {
      state.canvasSize = val
    },
    setGridSize(val: Dimensions) {
      state.gridSize = val
    },
    setViewportPos(val: Coords) {
      state.viewportPos = val
    },
    setActiveTool(val: ToolValueTypes) {
      state.activeTool = val
    },
    setZoomLevel(val: number) {
      state.zoomLevel = val
    },
    setZoomScale(val: number) {
      state.zoomScale = val
    },
    resetActiveTool() {
      state.activeTool = TOOLBAR_TOOLS.select
    },
  }

  return {
    ctx,
    ...toRefs(readonly(state)),
    ...getters,
    ...actions,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
