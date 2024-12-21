import { ref } from "vue"
import { defineStore } from "pinia"

// Types
import { type Coords } from "@ts/math.types"

export const useCanvasStore = defineStore("canvas", () => {
  const cssVars = ref<Map<string, CSSUnparsedSegment> | null>(null)
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)
  const mousePos = ref<Coords | null>(null)

  return {
    cssVars,
    x,
    y,
    width,
    height,
    mousePos,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
