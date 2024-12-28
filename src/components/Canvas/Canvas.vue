<script setup lang="ts">
import { type Ref, ref, reactive, onMounted, watch } from "vue"
import { storeToRefs } from "pinia"
import { useEventListener, useDebounceFn, useThrottleFn } from "@vueuse/core"

// Types
import { type Coords } from "@ts/math.types"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

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
import { getCssVars, setCssVar } from "@utils/helpers/dom.helpers"
import { assertExhaustiveGuard } from "@utils/helpers/typeguard.helpers"

// Components
import { Toolbar } from "@components/gui"

// Setup
const DEBOUNCE_RESIZE_MS = 500
const THROTTLE_MOUSE_MOVE_MS = 1000 / 60 // aka 60Hz

const canvasStore = useCanvasStore()

const { mousePos } = storeToRefs(canvasStore)

const wrapperRef: Ref<HTMLDivElement | null> = ref(null)
const gridRef: Ref<HTMLDivElement | null> = ref(null)
const canvasRef: Ref<HTMLCanvasElement | null> = ref(null)
const ctx: Ref<CanvasRenderingContext2D | null> = ref(null)

const wrapperBounds: Ref<DOMRect | null> = ref(null)
const gridBounds: Ref<DOMRect | null> = ref(null)

const activeMouseButtons = reactive<Map<MouseBtnValuesTypes, boolean>>(new Map())

// Helpers
const updateBounds = () => {
  if (!wrapperRef.value || !gridRef.value) return

  const cssVars = getCssVars()

  const cssSiteHeaderHeight = cssVars.get("--size-siteHeaderHeight")
  const cssSiteFooterHeight = cssVars.get("--size-siteFooterHeight")

  if (!cssSiteHeaderHeight || !cssSiteFooterHeight) return

  const siteHeaderHeight = parseInt(cssSiteHeaderHeight as string, 10)
  const siteFooterHeight = parseInt(cssSiteFooterHeight as string, 10)

  // Update local state
  wrapperBounds.value = wrapperRef.value.getBoundingClientRect()
  gridBounds.value = gridRef.value.getBoundingClientRect()

  // Update store
  canvasStore.$patch({
    cssVars,
    x: wrapperBounds.value.x,
    y: wrapperBounds.value.y,
    width: window.innerWidth,
    height: window.innerHeight - siteHeaderHeight - siteFooterHeight,
  })
}

const centreGrid = () => {
  if (!wrapperBounds.value || !gridBounds.value || !gridRef.value) return

  const newX = wrapperBounds.value.width / 2 - gridBounds.value.width / 2
  const newY = wrapperBounds.value.height / 2 - gridBounds.value.height / 2

  // Apply transforms
  gridRef.value.style.transform = `translate(${newX}px, ${newY}px)`

  // Update store
  canvasStore.viewportPos = {
    x: newX,
    y: newY,
  }
}

const zoom = (level: number) => {
  if (!gridRef.value || !canvasStore.cssVars) return

  const modifier = 1 + level * canvasConfig.zoom.stepSize

  const newTileSize = Math.round(modifier * canvasConfig.grid.tileSize)
  const newMaxWidth = Math.round(modifier * canvasConfig.dimensions.maxWidth)
  const newMaxHeight = Math.round(modifier * canvasConfig.dimensions.maxHeight)

  // Bundle Map updates
  const newCssVars = new Map([...canvasStore.cssVars])

  newCssVars.set("--canvas-bg-tile-size-px", `${newTileSize}px`)
  newCssVars.set("--canvas-max-width", `${newMaxWidth}px`)
  newCssVars.set("--canvas-max-height", `${newMaxHeight}px`)

  // Update CSS vars
  setCssVar("--canvas-bg-tile-size-px", `${newTileSize}px`)
  setCssVar("--canvas-max-width", `${newMaxWidth}px`)
  setCssVar("--canvas-max-height", `${newMaxHeight}px`)

  // Update local state
  gridBounds.value = gridRef.value.getBoundingClientRect()

  // Update store
  canvasStore.$patch({
    cssVars: newCssVars,
    zoomLevel: level,
  })
}

const zoomIn = () => {
  const newLevel = canvasStore.zoomLevel + 1

  if (newLevel > canvasConfig.zoom.max) return

  zoom(newLevel)
}

const zoomOut = () => {
  const newLevel = canvasStore.zoomLevel - 1

  if (newLevel < canvasConfig.zoom.min) return

  zoom(newLevel)
}

const bindListeners = () => {
  if (!canvasRef.value) return

  useEventListener(window, "resize", handleOnResize)
  useEventListener(canvasRef, "mousedown", handleMouseDown)
  useEventListener(window, "mouseup", handleMouseUp)
  useEventListener(window, "mousemove", handleMouseMove)
  useEventListener(canvasRef, "wheel", handleWheel)
}

const panCanvas = (mousePos: Coords | null, prevMousePos: Coords | null) => {
  if (
    !mousePos ||
    !prevMousePos ||
    !gridRef.value ||
    !wrapperBounds.value ||
    !gridBounds.value ||
    !canvasStore.cssVars ||
    !canvasStore.viewportPos
  ) {
    return
  }

  const cssSiteHeaderHeight = canvasStore.cssVars.get("--size-siteHeaderHeight")
  const cssSiteFooterHeight = canvasStore.cssVars.get("--size-siteFooterHeight")

  if (!cssSiteHeaderHeight || !cssSiteFooterHeight) return

  const siteHeaderHeight = parseInt(cssSiteHeaderHeight as string, 10)
  const siteFooterHeight = parseInt(cssSiteFooterHeight as string, 10)

  const dX = mousePos.x - prevMousePos.x
  const dY = mousePos.y - prevMousePos.y

  const newX = canvasStore.viewportPos.x + dX
  const newY = canvasStore.viewportPos.y + dY

  const finalX =
    // Check if the viewport is smaller than the window
    gridBounds.value.width < window.innerWidth
      ? wrapperBounds.value.width / 2 - gridBounds.value.width / 2
      : // or if outside left bounds
        newX > 0
        ? 0
        : // or outside right bounds
          newX < window.innerWidth - gridBounds.value.width
          ? window.innerWidth - gridBounds.value.width
          : // else assign the newly calculated coords
            newX

  const finalY =
    // Check if the viewport is smaller than the window
    gridBounds.value.height < window.innerHeight
      ? wrapperBounds.value.height / 2 - gridBounds.value.height / 2
      : // or if outside top bounds
        newY > 0
        ? 0
        : // or outside bottom bounds
          newY < window.innerHeight - siteHeaderHeight - siteFooterHeight - gridBounds.value.height
          ? window.innerHeight - siteHeaderHeight - siteFooterHeight - gridBounds.value.height
          : // else assign the newly calculated coords
            newY

  canvasStore.viewportPos = {
    x: finalX,
    y: finalY,
  }
}

// Handlers
const handleOnResize = useDebounceFn(() => {
  updateBounds()
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
  canvasStore.mousePos = {
    x: e.clientX,
    y: e.clientY,
  }
}, THROTTLE_MOUSE_MOVE_MS)

const handleWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Lifecycle
onMounted(() => {
  ctx.value = canvasRef.value?.getContext("2d") || null

  if (!ctx.value) return

  updateBounds()
  centreGrid()
  bindListeners()
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

canvasStore.$onAction(({ name }) => {
  switch (name) {
    case "actionCentre":
      centreGrid()
      break
    case "actionZoomIn":
      zoomIn()
      break
    case "actionZoomOut":
      zoomOut()
      break
    default:
      assertExhaustiveGuard(name)
      break
  }
})
</script>

<template>
  <div
    ref="wrapperRef"
    :class="[$style.wrapper, activeMouseButtons.get('middle') ? IS_GRABBING : IS_GRAB]"
  >
    <Toolbar />
    <div ref="gridRef" :class="$style.grid" />
    <canvas ref="canvasRef" :width="canvasStore.width || 0" :height="canvasStore.height || 0" />
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
  width: var(--canvas-max-width);
  height: var(--canvas-max-height);
  background: var(--p-cross);
  background-size: var(--canvas-bg-tile-size-px) var(--canvas-bg-tile-size-px);
  border: 5px solid var(--c-accent-2);
  transform-origin: top left;
}
</style>
