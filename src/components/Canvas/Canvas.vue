<script setup lang="ts">
import { type Ref, ref, reactive, onMounted, watch } from "vue"
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
import { getCssVars } from "@utils/helpers/dom.helpers"

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

const updateBounds = () => {
  if (!wrapperRef.value || !gridRef.value) return

  const cssVars = getCssVars()

  const cssSiteHeaderHeight = cssVars.get("--size-siteHeaderHeight")
  const cssSiteFooterHeight = cssVars.get("--size-siteFooterHeight")

  if (!cssSiteHeaderHeight || !cssSiteFooterHeight) return

  const siteHeaderHeight = parseInt(cssSiteHeaderHeight as string, 10)
  const siteFooterHeight = parseInt(cssSiteFooterHeight as string, 10)

  wrapperBounds.value = wrapperRef.value.getBoundingClientRect()
  gridBounds.value = gridRef.value.getBoundingClientRect()

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

  gridRef.value.style.transform = `translate(${newX}px, ${newY}px)`

  canvasStore.viewportPos = {
    x: newX,
    y: newY,
  }
}

const bindListeners = () => {
  if (!canvasRef.value) return

  useEventListener(window, "resize", handleOnResize)
  useEventListener(canvasRef, "mousedown", handleMouseDown)
  useEventListener(window, "mouseup", handleMouseUp)
  useEventListener(window, "mousemove", handleMouseMove)
}

const panCanvas = (state: Coords | null, prevState: Coords | null) => {
  if (
    !state ||
    !prevState ||
    !gridRef.value ||
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

  const dX = state.x - prevState.x
  const dY = state.y - prevState.y

  const newX = canvasStore.viewportPos.x + dX
  const newY = canvasStore.viewportPos.y + dY

  const finalX =
    // Check if outside left bounds
    newX > 0
      ? 0
      : // or outside right bounds
        newX < window.innerWidth - gridBounds.value.width
        ? window.innerWidth - gridBounds.value.width
        : // else assign the newly calculated coords
          newX

  const finalY =
    // Check if outside top bounds
    newY > siteHeaderHeight
      ? siteHeaderHeight
      : // or outside bottom bounds
        newY < window.innerHeight - siteFooterHeight - gridBounds.value.height
        ? window.innerHeight - siteFooterHeight - gridBounds.value.height
        : // else assign the newly calculated coords
          newY

  canvasStore.viewportPos = {
    x: finalX,
    y: finalY,
  }

  gridRef.value.style.transform = `translate(${finalX}px, ${finalY}px)`
}

// Handlers
const handleOnResize = useDebounceFn(() => {
  updateBounds()
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
</script>

<template>
  <div
    ref="wrapperRef"
    :class="[$style.wrapper, activeMouseButtons.get('middle') ? IS_GRABBING : IS_GRAB]"
  >
    <div ref="gridRef" :class="$style.grid" />
    <canvas ref="canvasRef" :width="canvasStore.width || 0" :height="canvasStore.height || 0" />
  </div>
</template>

<style lang="css" module>
.wrapper {
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
