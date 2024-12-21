<script setup lang="ts">
import { type Ref, ref, reactive, onMounted, watch } from "vue"
import { useEventListener, useDebounceFn, useThrottleFn } from "@vueuse/core"

// Types
import { type Coords } from "@ts/math.types"

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
import { storeToRefs } from "pinia"

// Setup
const DEBOUNCE_RESIZE_MS = 500
const THROTTLE_MOUSE_MOVE_MS = 15

const canvasStore = useCanvasStore()

const { mousePos } = storeToRefs(canvasStore)

const wrapperRef: Ref<HTMLDivElement | null> = ref(null)
const underlayRef: Ref<HTMLDivElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null)
const viewportPos = ref<Coords | null>({
  x: 0,
  y: 0,
})

const activeMouseButtons = reactive<Map<MouseBtnValuesTypes, boolean>>(new Map())

const panCanvas = (state: Coords | null, prevState: Coords | null) => {
  if (!state || !prevState || !viewportPos.value || !underlayRef.value) return

  const dX = state.x - prevState.x
  const dY = state.y - prevState.y

  const newX = viewportPos.value.x + dX
  const newY = viewportPos.value.y + dY

  viewportPos.value = {
    x: newX,
    y: newY,
  }

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
  canvasStore.mousePos = {
    x: e.clientX,
    y: e.clientY,
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
  useEventListener(window, "mouseup", handleMouseUp)
  useEventListener(window, "mousemove", handleMouseMove)
})

watch(mousePos, (state, prevState) => {
  switch (true) {
    case activeMouseButtons.get("middle"):
      panCanvas(state, prevState)
      return
    default:
      return
  }
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
  flex: 1;
}

.overlay {
  position: absolute;
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
  border: 5px solid var(--c-accent-2);
}
</style>
