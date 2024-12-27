import { ref } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords } from "@ts/math.types"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

export type CANVAS_CENTRE = "CANVAS/CENTRE"
export type CANVAS_ZOOM_IN = "CANVAS/ZOOM_IN"
export type CANVAS_ZOOM_OUT = "CANVAS/ZOOM_OUT"

export type ACTIONS_CANVAS = CANVAS_CENTRE | CANVAS_ZOOM_IN | CANVAS_ZOOM_OUT

export interface ACTION_CANVAS_CENTRE {
  type: CANVAS_CENTRE
}

export interface ACTION_CANVAS_ZOOM_IN {
  type: CANVAS_ZOOM_IN
}

export interface ACTION_CANVAS_ZOOM_OUT {
  type: CANVAS_ZOOM_OUT
}

export type ACTION_CANVAS = ACTION_CANVAS_CENTRE | ACTION_CANVAS_ZOOM_IN | ACTION_CANVAS_ZOOM_OUT

export const useCanvasStore = defineStore("canvas", () => {
  const cssVars = ref<Map<string, CSSUnparsedSegment> | null>(null)
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)
  const viewportPos = ref<Coords | null>(null)
  const mousePos = ref<Coords | null>(null)
  const zoomLevel = ref<number>(canvasConfig.zoom.default)

  const actionCentre = (): ACTION_CANVAS_CENTRE => ({
    type: "CANVAS/CENTRE",
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
    actionCentre,
    actionZoomIn,
    actionZoomOut,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
