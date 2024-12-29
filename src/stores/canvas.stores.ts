import { ref } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords } from "@ts/math.types"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Utils
import { CanvasNode } from "@utils/canvas/nodes"

export type CANVAS_ADD_RECTANGLE = "CANVAS/ADD_RECTANGLE"
export type CANVAS_RESET = "CANVAS/RESET"
export type CANVAS_ZOOM_IN = "CANVAS/ZOOM_IN"
export type CANVAS_ZOOM_OUT = "CANVAS/ZOOM_OUT"

export type ACTIONS_CANVAS = CANVAS_ADD_RECTANGLE | CANVAS_RESET | CANVAS_ZOOM_IN | CANVAS_ZOOM_OUT

export interface ACTION_CANVAS_ADD_RECTANGLE {
  type: CANVAS_ADD_RECTANGLE
}

export interface ACTION_CANVAS_RESET {
  type: CANVAS_RESET
}

export interface ACTION_CANVAS_ZOOM_IN {
  type: CANVAS_ZOOM_IN
}

export interface ACTION_CANVAS_ZOOM_OUT {
  type: CANVAS_ZOOM_OUT
}

export type ACTION_CANVAS = ACTION_CANVAS_RESET | ACTION_CANVAS_ZOOM_IN | ACTION_CANVAS_ZOOM_OUT

export const useCanvasStore = defineStore("canvas", () => {
  const cssVars = ref<Map<string, CSSUnparsedSegment> | null>(null)
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)
  const viewportPos = ref<Coords | null>(null)
  const mousePos = ref<Coords | null>(null)
  const zoomLevel = ref<number>(canvasConfig.zoom.default)
  const nodes = ref<CanvasNode[]>([])

  const actionAddRectangle = (): ACTION_CANVAS_ADD_RECTANGLE => ({
    type: "CANVAS/ADD_RECTANGLE",
  })

  const actionReset = (): ACTION_CANVAS_RESET => ({
    type: "CANVAS/RESET",
  })

  const actionZoomIn = (): ACTION_CANVAS_ZOOM_IN => ({
    type: "CANVAS/ZOOM_IN",
  })

  const actionZoomOut = (): ACTION_CANVAS_ZOOM_OUT => ({
    type: "CANVAS/ZOOM_OUT",
  })

  return {
    cssVars,
    x,
    y,
    width,
    height,
    viewportPos,
    mousePos,
    zoomLevel,
    actionAddRectangle,
    actionReset,
    actionZoomIn,
    actionZoomOut,
    nodes,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
