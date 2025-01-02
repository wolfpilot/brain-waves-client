<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue"
import { storeToRefs } from "pinia"
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
import { useCanvas } from "@utils/services/useCanvas.services"
import { getCssVars } from "@utils/helpers/dom.helpers"
import Engine from "@utils/canvas/core/Engine.canvas"

// Components
import { Toolbar } from "@components/gui"
import type { CanvasStore } from "@stores/canvas.stores"

// Setup
const DEBOUNCE_RESIZE_MS = 500
const THROTTLE_MOUSE_MOVE_MS = 1000 / 60 // aka 60Hz

const canvasStore = useCanvasStore()
const canvasService = useCanvas()

const { viewportPos, mousePos } = storeToRefs(canvasStore)

const gridRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const activeMouseButtons = reactive<Map<MouseBtnValuesTypes, boolean>>(new Map())

// Helpers
const updateCssVars = () => {
  canvasStore.setCssVars(getCssVars())
}

const updateCanvasSize = () => {
  if (!canvasStore.siteHeaderHeight || !canvasStore.siteFooterHeight) return

  canvasStore.setCanvasSize({
    width: window.innerWidth,
    height: window.innerHeight - canvasStore.siteHeaderHeight - canvasStore.siteFooterHeight,
  })
}

const updateGridSize = () => {
  if (!gridRef.value) return

  const gridBounds = gridRef.value.getBoundingClientRect()

  canvasStore.setGridSize({
    width: gridBounds.width,
    height: gridBounds.height,
  })
}

const panViewport = (mousePos: Coords | null, prevMousePos: Coords | null) => {
  if (
    !mousePos ||
    !prevMousePos ||
    !canvasStore.canvasSize ||
    !canvasStore.gridSize ||
    !canvasStore.viewportPos ||
    !canvasStore.siteHeaderHeight ||
    !canvasStore.siteFooterHeight
  ) {
    return
  }

  const dX = mousePos.x - prevMousePos.x
  const dY = mousePos.y - prevMousePos.y

  const newX = canvasStore.viewportPos.x + dX
  const newY = canvasStore.viewportPos.y + dY

  const finalX =
    // Check if the viewport is smaller than the window
    canvasStore.gridSize.width < window.innerWidth
      ? canvasStore.canvasSize.width / 2 - canvasStore.gridSize.width / 2
      : // or if outside left bounds
        newX > 0
        ? 0
        : // or outside right bounds
          newX < window.innerWidth - canvasStore.gridSize.width
          ? window.innerWidth - canvasStore.gridSize.width
          : // else assign the newly calculated coords
            newX

  const finalY =
    // Check if the viewport is smaller than the window
    canvasStore.gridSize.height < window.innerHeight
      ? canvasStore.canvasSize.height / 2 - canvasStore.gridSize.height / 2
      : // or if outside top bounds
        newY > 0
        ? 0
        : // or outside bottom bounds
          newY <
            window.innerHeight -
              canvasStore.siteHeaderHeight -
              canvasStore.siteFooterHeight -
              canvasStore.gridSize.height
          ? window.innerHeight -
            canvasStore.siteHeaderHeight -
            canvasStore.siteFooterHeight -
            canvasStore.gridSize.height
          : // else assign the newly calculated coords
            newY

  // Update store
  canvasStore.setViewportPos({
    x: finalX,
    y: finalY,
  })
}

// Handlers
const handleResize = useDebounceFn(() => {
  updateCssVars()
  updateCanvasSize()
  updateGridSize()
}, DEBOUNCE_RESIZE_MS)

const handleMouseDown = (e: MouseEvent) => {
  const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

  activeMouseButtons.set(activeBtn, true)
}

const handleMouseUp = (e: MouseEvent) => {
  const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

  activeMouseButtons.set(activeBtn, false)
}

const handleMouseMove = useThrottleFn((e: MouseEvent) => {
  canvasStore.setMousePos({
    x: e.clientX,
    y: e.clientY,
  })
}, THROTTLE_MOUSE_MOVE_MS)

const handleWheel = (e: WheelEvent) => {
  return e.deltaY < 0 ? canvasService.zoomIn() : canvasService.zoomOut()
}

const bindListeners = () => {
  if (!canvasRef.value) return

  useEventListener(window, "resize", handleResize)
  useEventListener(canvasRef, "mousedown", handleMouseDown)
  useEventListener(window, "mouseup", handleMouseUp)
  useEventListener(window, "mousemove", handleMouseMove)
  useEventListener(canvasRef, "wheel", handleWheel)
}

// Lifecycle
onMounted(() => {
  const ctx = canvasRef.value?.getContext("2d") || null

  if (!ctx) return

  canvasStore.setContext(ctx)

  updateCssVars()
  updateCanvasSize()
  updateGridSize()
  bindListeners()

  canvasService.reset()

  // Initialize entities
  const engine = new Engine()

  engine.init()
})

const onViewportPosChange = (state: CanvasStore["viewportPos"]) => {
  if (!state || !gridRef.value) return

  gridRef.value.style.transform = `translate(${state.x}px, ${state.y}px)`
}

const onMousePosChange = (
  state: CanvasStore["viewportPos"],
  prevState: CanvasStore["viewportPos"],
) => {
  switch (true) {
    case activeMouseButtons.get("middle"):
      panViewport(state, prevState)
      return
    default:
      return
  }
}

watch(viewportPos, onViewportPosChange)
watch(mousePos, onMousePosChange)
</script>

<template>
  <div :class="[$style.wrapper, activeMouseButtons.get('middle') ? IS_GRABBING : IS_GRAB]">
    <Toolbar />
    <div ref="gridRef" :class="$style.grid" />
    <canvas
      ref="canvasRef"
      :width="canvasStore.canvasSize?.width || 0"
      :height="canvasStore.canvasSize?.height || 0"
    />
  </div>
</template>

<style lang="css" module>
.wrapper {
  position: relative;
  flex: 1;
}

.grid {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: var(--canvas-grid-width);
  height: var(--canvas-grid-height);
  background: var(--p-cross);
  background-size: var(--canvas-grid-tile-size-px) var(--canvas-grid-tile-size-px);
  border: 5px solid var(--c-accent-2);
  transform-origin: top left;
}
</style>
