<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue"
import { storeToRefs } from "pinia"

// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { type IoStore, useIoStore } from "@stores/io.stores"
import { useEngineStore } from "@stores/engine.stores"

// Constants
import { CLASSNAMES } from "@constants/styles.constants"

// Utils
import { useCanvas } from "@utils/services"
import { getCssVars, setCssVar } from "@utils/helpers/dom.helpers"
import { IoManager } from "@utils/managers"
import { Engine } from "@utils/canvas/core"

// Components
import { Toolbar } from "@components/gui"

const canvasStore = useCanvasStore()
const ioStore = useIoStore()
const engineStore = useEngineStore()
const canvasService = useCanvas()

const { viewportOffset, zoomScale } = storeToRefs(canvasStore)
const { windowSize, mousePos, wheelOffsetY } = storeToRefs(ioStore)

const gridRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const classNames = {
  mouseCursor: computed(() => {
    switch (true) {
      case ioStore.activeMouseButtons.get("middle"):
        return CLASSNAMES.cursor.IS_GRABBING
      case !!engineStore.activeNodeId:
        return CLASSNAMES.cursor.IS_POINTER
      case !!engineStore.hoveredNodeId:
        return CLASSNAMES.cursor.IS_DEFAULT
      default:
        return CLASSNAMES.cursor.IS_GRAB
    }
  }),
}

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

const panViewport = (dX: number, dY: number) => {
  if (
    !canvasStore.viewportPos ||
    !canvasStore.canvasSize ||
    !canvasStore.scaledGridSize ||
    !canvasStore.siteHeaderHeight ||
    !canvasStore.siteFooterHeight
  ) {
    return
  }
  const newX = canvasStore.viewportPos.x - dX
  const newY = canvasStore.viewportPos.y - dY

  const boundsX = (canvasStore.scaledGridSize.width - canvasStore.canvasSize.width) / 2
  const boundsY = (canvasStore.scaledGridSize.height - canvasStore.canvasSize.height) / 2

  const finalX =
    // Check if the viewport is smaller than the window
    canvasStore.scaledGridSize.width < window.innerWidth
      ? 0
      : // or if outside left bounds
        newX < -boundsX
        ? -boundsX
        : // or outside right bounds
          newX > boundsX
          ? boundsX
          : // else assign the newly calculated coords
            newX

  const finalY =
    // Check if the viewport is smaller than the window
    canvasStore.scaledGridSize.height < window.innerHeight
      ? 0
      : // or if outside top bounds
        newY < -boundsY
        ? -boundsY
        : // or outside bottom bounds
          newY > boundsY
          ? boundsY
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
  const ioManager = new IoManager()
  const engine = new Engine()

  ioManager.init()
  engine.init()
})

// Handlers
const onWindowSizeChange = () => {
  updateCssVars()
  updateCanvasSize()

  // Force viewport to stay within boundaries
  panViewport(0, 0)
}

const onViewportOffsetChange = (state: CanvasStore["viewportOffset"]) => {
  if (!state || !gridRef.value) return

  gridRef.value.style.transform = `translate(${state.x}px, ${state.y}px)`
}

const onMousePosChange = (state: IoStore["mousePos"], prevState: IoStore["mousePos"]) => {
  if (!state || !prevState) return

  switch (true) {
    case ioStore.activeMouseButtons.get("middle"):
      panViewport(state.x - prevState.x, state.y - prevState.y)
      return
    default:
      return
  }
}

const onWheelOffsetYChange = (
  state: IoStore["wheelOffsetY"],
  prevState: IoStore["wheelOffsetY"],
) => {
  if (!ioStore.scaledMousePosOffset) return

  return state - prevState < 0
    ? canvasService.doZoomIn(ioStore.scaledMousePosOffset)
    : canvasService.doZoomOut(ioStore.scaledMousePosOffset)
}

const onZoomScaleChange = () => {
  if (!canvasStore.cssVars || !canvasStore.scaledGridSize || !canvasStore.scaledGridTileSize) return

  // Bundle Map updates
  const newCssVars = new Map([...canvasStore.cssVars])

  newCssVars.set("--canvas-grid-width", `${canvasStore.scaledGridSize.width}px`)
  newCssVars.set("--canvas-grid-height", `${canvasStore.scaledGridSize.height}px`)
  newCssVars.set("--canvas-grid-tile-size-px", `${canvasStore.scaledGridTileSize}px`)

  // Update CSS vars
  setCssVar("--canvas-grid-width", `${canvasStore.scaledGridSize.width}px`)
  setCssVar("--canvas-grid-height", `${canvasStore.scaledGridSize.height}px`)
  setCssVar("--canvas-grid-tile-size-px", `${canvasStore.scaledGridTileSize}px`)

  // Update store
  canvasStore.setCssVars(newCssVars)

  // Force viewport to stay within boundaries
  panViewport(0, 0)
}

watch(windowSize, onWindowSizeChange)
watch(mousePos, onMousePosChange)
watch(viewportOffset, onViewportOffsetChange)
watch(wheelOffsetY, onWheelOffsetYChange)
watch(zoomScale, onZoomScaleChange)
</script>

<template>
  <div :class="[$style.wrapper, classNames.mouseCursor.value]">
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--canvas-grid-width);
  height: var(--canvas-grid-height);
  background: var(--p-cross);
  background-size: var(--canvas-grid-tile-size-px) var(--canvas-grid-tile-size-px);
  border: 5px solid var(--c-accent-2);
}
</style>
