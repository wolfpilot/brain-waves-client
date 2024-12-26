import { ref } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords } from "@ts/math.types"

export type CANVAS_CENTRE = "CANVAS/CENTRE"

export type ACTIONS_CANVAS = CANVAS_CENTRE

export interface ACTION_CANVAS_CENTRE {
  type: CANVAS_CENTRE
}

export type ACTION_CANVAS = ACTION_CANVAS_CENTRE

export const useCanvasStore = defineStore("canvas", () => {
  const cssVars = ref<Map<string, CSSUnparsedSegment> | null>(null)
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)
  const viewportPos = ref<Coords | null>(null)
  const mousePos = ref<Coords | null>(null)

  const actionCentre = (): ACTION_CANVAS_CENTRE => ({
    type: "CANVAS/CENTRE",
  })

  return {
    cssVars,
    x,
    y,
    width,
    height,
    viewportPos,
    mousePos,
    actionCentre,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
