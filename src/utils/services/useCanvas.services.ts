import { createSharedComposable } from "@vueuse/core"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Constants
import { TOOLBAR_TOOLS } from "@constants/toolbar.constants"

// Stores
import { useCanvasStore } from "@stores/canvas.stores"

// Utils
import { useEngine } from "@utils/services"

const useCanvas = () => {
  const canvasStore = useCanvasStore()
  const engineService = useEngine()

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
    const newLevel = Math.min(canvasStore.zoomLevel + 1, canvasConfig.zoom.max)

    canvasStore.setZoomLevel(newLevel)
  }

  const doZoomOut = () => {
    const newLevel = Math.max(canvasStore.zoomLevel - 1, canvasConfig.zoom.min)

    canvasStore.setZoomLevel(newLevel)
  }

  const doReset = () => {
    canvasStore.setZoomLevel(canvasConfig.zoom.default)
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
