import { ref } from "vue"
import { defineStore } from "pinia"

export const useCanvasStore = defineStore("canvas", () => {
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const width = ref<number | null>(null)
  const height = ref<number | null>(null)

  return {
    x,
    y,
    width,
    height,
  }
})

export type CanvasStore = Omit<
  ReturnType<typeof useCanvasStore>,
  keyof ReturnType<typeof defineStore>
>
