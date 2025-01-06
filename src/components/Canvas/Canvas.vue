<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { storeToRefs } from "pinia"

// Types
import { type Coords } from "@ts/math.types"

// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"

// Constants
import { IS_GRAB, IS_GRABBING } from "@constants/styles.constants"

// Utils
import { useCanvas } from "@utils/services/useCanvas.services"
import { getCssVars } from "@utils/helpers/dom.helpers"
import Engine from "@utils/canvas/core/Engine.canvas"
import IoManager from "@utils/managers/io.managers"

// Components
import { Toolbar } from "@components/gui"

const canvasStore = useCanvasStore()
const ioStore = useIoStore()
const canvasService = useCanvas()

const { viewportPos } = storeToRefs(canvasStore)
const { windowSize, mousePos, wheelOffsetY } = storeToRefs(ioStore)

const gridRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

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

// Lifecycle
onMounted(() => {
  const ctx = canvasRef.value?.getContext("2d") || null

  if (!ctx) return

  canvasStore.setContext(ctx)

  updateCssVars()
  updateCanvasSize()
  updateGridSize()

  canvasService.doReset()

  // Initialize entities
  const engine = new Engine()
  const ioManager = new IoManager()

  engine.init()
  ioManager.init()
})

// Handlers
const onWindowSizeChange = () => {
  updateCssVars()
  updateCanvasSize()
  updateGridSize()
}

const onViewportPosChange = (state: CanvasStore["viewportPos"]) => {
  if (!state || !gridRef.value) return

  gridRef.value.style.transform = `translate(${state.x}px, ${state.y}px)`
}

const onMousePosChange = (
  state: CanvasStore["viewportPos"],
  prevState: CanvasStore["viewportPos"],
) => {
  switch (true) {
    case ioStore.activeMouseButtons.get("middle"):
      panViewport(state, prevState)
      return
    default:
      return
  }
}

const onWheelOffsetYChange = (
  state: IoStore["wheelOffsetY"],
  prevState: IoStore["wheelOffsetY"],
) => {
  return state - prevState < 0 ? canvasService.doZoomIn() : canvasService.doZoomOut()
}

watch(windowSize, onWindowSizeChange)
watch(mousePos, onMousePosChange)
watch(wheelOffsetY, onWheelOffsetYChange)
watch(viewportPos, onViewportPosChange)
</script>

<template>
  <div :class="[$style.wrapper, ioStore.activeMouseButtons.get('middle') ? IS_GRABBING : IS_GRAB]">
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
