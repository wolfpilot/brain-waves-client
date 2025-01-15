import { createSharedComposable } from "@vueuse/core"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Constants
import { TOOLBAR_TOOLS } from "@constants/toolbar.constants"

// Stores
import { type CanvasStore, useCanvasStore } from "@stores/canvas.stores"
import { useIoStore } from "@stores/io.stores"

// Utils
import { useEngine } from "@utils/services"

const useCanvas = () => {
  const canvasStore = useCanvasStore()
  const ioStore = useIoStore()
  const engineService = useEngine()

  // Helpers
  const zoomTo = (
    scaleFactor: number,
    level: CanvasStore["zoomLevel"],
    scale: CanvasStore["zoomScale"],
  ) => {
    if (!canvasStore.viewportPos || !ioStore.mousePosOffset) return

    const dX = canvasStore.viewportPos.x + ioStore.mousePosOffset.x * (scaleFactor - 1)
    const dY = canvasStore.viewportPos.y + ioStore.mousePosOffset.y * (scaleFactor - 1)

    canvasStore.setViewportPos({
      x: -dX,
      y: -dY,
    })

    canvasStore.setZoomLevel(level)
    canvasStore.setZoomScale(scale)

    canvasStore.setViewportPos({
      x: dX,
      y: dY,
    })
  }

  // API
  const doSelect = () => {
    engineService.clearActiveNode()

    canvasStore.setActiveTool(TOOLBAR_TOOLS.select)
  }

  const doRectangle = () => {
    engineService.clearActiveNode()
    engineService.addRectangle()

    canvasStore.setActiveTool(TOOLBAR_TOOLS.rectangle)
  }

  const doCircle = () => {
    engineService.clearActiveNode()
    engineService.addCircle()

    canvasStore.setActiveTool(TOOLBAR_TOOLS.circle)
  }

  const doZoomIn = () => {
    if (canvasStore.zoomLevel >= canvasConfig.zoom.max) return

    const newScaleFactor = canvasConfig.zoom.factor
    const newLevel = Math.min(canvasStore.zoomLevel + 1, canvasConfig.zoom.max)
    const newScale = +(canvasStore.zoomScale * newScaleFactor).toPrecision(3)

    zoomTo(newScaleFactor, newLevel, newScale)
  }

  const doZoomOut = () => {
    if (canvasStore.zoomLevel <= canvasConfig.zoom.min) return

    const newScaleFactor = 1 / canvasConfig.zoom.factor
    const newLevel = Math.max(canvasStore.zoomLevel - 1, canvasConfig.zoom.min)
    const newScale = +(canvasStore.zoomScale * newScaleFactor).toPrecision(3)

    zoomTo(newScaleFactor, newLevel, newScale)
  }

  const doReset = () => {
    canvasStore.setZoomLevel(canvasConfig.zoom.level)
    canvasStore.setZoomScale(canvasConfig.zoom.scale)
    canvasStore.setViewportPos({
      x: 0,
      y: 0,
    })
  }

  return {
    doSelect,
    doCircle,
    doRectangle,
    doZoomIn,
    doZoomOut,
    doReset,
  }
}

export default createSharedComposable(useCanvas)
