<script setup lang="ts">
import { type Ref, ref, reactive, onMounted } from "vue"
import { useEventListener, useDebounceFn, useThrottleFn } from "@vueuse/core"

// Stores
import { useCanvasStore } from "@stores/index"

// Constants
import {
  MouseKeyToValue,
  type MouseBtnKeys,
  type MouseBtnValuesTypes,
} from "@constants/keys.constants"
import { IS_GRAB, IS_GRABBING } from "@constants/styles.constants"

// Utils
import { getCssVars } from "@utils/helpers/dom.helpers"

// Setup
const DEBOUNCE_RESIZE_MS = 500
const THROTTLE_MOUSE_MOVE_MS = 15

const canvasStore = useCanvasStore()

const wrapperRef: Ref<HTMLDivElement | null> = ref(null)
const underlayRef: Ref<HTMLDivElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null)

const activeMouseButtons = reactive<Map<MouseBtnValuesTypes, boolean>>(new Map())

const panCanvas = (e: MouseEvent) => {
  if (!underlayRef.value || !canvasStore.width || !canvasStore.height) return

  const newX = e.clientX - canvasStore.width / 2
  const newY = e.clientY - canvasStore.height / 2

  underlayRef.value.style.transform = `translate(${newX}px, ${newY}px)`
}

// Handlers
const handleOnResize = useDebounceFn(() => {
  if (!wrapperRef.value) return

  const bounds = wrapperRef.value.getBoundingClientRect()

  canvasStore.$patch({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  })
}, DEBOUNCE_RESIZE_MS)

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()

  const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

  activeMouseButtons.set(activeBtn, true)
}

const handleMouseUp = (e: MouseEvent) => {
  e.preventDefault()

  const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

  activeMouseButtons.set(activeBtn, false)
}

const handleMouseMove = useThrottleFn((e: MouseEvent) => {
  switch (true) {
    case activeMouseButtons.get("middle"):
      panCanvas(e)
      return
    default:
      return
  }
}, THROTTLE_MOUSE_MOVE_MS)

// Lifecycle
onMounted(() => {
  ctx.value = canvasRef.value?.getContext("2d") || null

  if (!wrapperRef.value || !canvasRef.value || !ctx.value) return

  // Setup
  const cssVars = getCssVars()
  const bounds = wrapperRef.value.getBoundingClientRect()

  canvasStore.$patch({
    cssVars,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  })

  // Bind listeners
  useEventListener(window, "resize", handleOnResize)
  useEventListener(canvasRef, "mousedown", handleMouseDown)
  useEventListener(canvasRef, "mouseup", handleMouseUp)
  useEventListener(canvasRef, "mousemove", handleMouseMove)
})
</script>

<template>
  <div
    ref="wrapperRef"
    :class="[$style.wrapper, activeMouseButtons.get('middle') ? IS_GRABBING : IS_GRAB]"
  >
    <div :class="$style.overlay">
      <div ref="underlayRef" :class="$style.underlay"></div>
    </div>
    <canvas ref="canvasRef" :width="canvasStore.width || 0" :height="canvasStore.height || 0" />
  </div>
</template>

<style lang="css" module>
.wrapper {
  --canvas-max-width: 4000px;
  --canvas-max-height: 2000px;
  --canvas-bg-tile-size-px: 60px;

  flex: 1;
}

.overlay {
  position: fixed;
  z-index: -1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--canvas-max-width);
  height: var(--canvas-max-height);
}

.underlay {
  width: 100%;
  height: 100%;
  background: var(--p-cross);
  background-size: var(--canvas-bg-tile-size-px) var(--canvas-bg-tile-size-px);
}
</style>
