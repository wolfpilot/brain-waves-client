<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue"
import { useEventListener, useDebounceFn } from "@vueuse/core"

// Stores
import { useCanvasStore } from "@stores/index"

const canvasStore = useCanvasStore()

const wrapperRef: Ref<HTMLDivElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null)

// Handlers
const handleOnResize = useDebounceFn((e: UIEvent) => {
  if (!wrapperRef.value) return

  const bounds = wrapperRef.value.getBoundingClientRect()

  canvasStore.$patch({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  })
}, 500)

// Lifecycle
onMounted(() => {
  ctx.value = canvasRef.value?.getContext("2d") || null

  if (!wrapperRef.value || !canvasRef.value || !ctx.value) return

  const bounds = wrapperRef.value.getBoundingClientRect()

  canvasStore.$patch({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  })

  useEventListener(window, "resize", handleOnResize)
})
</script>

<template>
  <div ref="wrapperRef" :class="$style.wrapper">
    <canvas ref="canvasRef" :width="canvasStore.width || 0" :height="canvasStore.height || 0" />
  </div>
</template>

<style lang="css" module>
.wrapper {
  flex: 1;
}
</style>
