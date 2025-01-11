import { createSharedComposable } from "@vueuse/core"

// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Constants
import { TOOLBAR_TOOLS } from "@constants/toolbar.constants"

// Stores
import { useCanvasStore } from "@stores/canvas.stores"

// Utils
import { useEngine } from "@utils/services"
import { setCssVar } from "@utils/helpers/dom.helpers"

const useCanvas = () => {
  const canvasStore = useCanvasStore()
  const engineService = useEngine()

  // Helpers
  const _centre = () => {
    if (!canvasStore.centrePos) return

    canvasStore.setViewportPos({
      x: canvasStore.centrePos.x,
      y: canvasStore.centrePos.y,
    })
  }

  const _zoom = (level: number) => {
    if (!canvasStore.cssVars) return

    /**
     * NOTE: It's important to first update the zoomLevel
     * based on which the scale will then be computed.
     */
    canvasStore.setZoomLevel(level)

    const newGridTileSize = Math.round(canvasStore.zoomScale * canvasConfig.grid.tileSize)
    const newGridWidth = Math.round(canvasStore.zoomScale * canvasConfig.grid.maxWidth)
    const newGridHeight = Math.round(canvasStore.zoomScale * canvasConfig.grid.maxHeight)

    // Bundle Map updates
    const newCssVars = new Map([...canvasStore.cssVars])

    newCssVars.set("--canvas-grid-tile-size-px", `${newGridTileSize}px`)
    newCssVars.set("--canvas-grid-width", `${newGridWidth}px`)
    newCssVars.set("--canvas-grid-height", `${newGridHeight}px`)

    // Update CSS vars
    setCssVar("--canvas-grid-tile-size-px", `${newGridTileSize}px`)
    setCssVar("--canvas-grid-width", `${newGridWidth}px`)
    setCssVar("--canvas-grid-height", `${newGridHeight}px`)

    // Update store
    canvasStore.setCssVars(newCssVars)
    canvasStore.setGridSize({
      width: newGridWidth,
      height: newGridHeight,
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
    const newLevel = Math.min(canvasStore.zoomLevel + 1, canvasConfig.zoom.max)

    _zoom(newLevel)
  }

  const doZoomOut = () => {
    const newLevel = Math.max(canvasStore.zoomLevel - 1, canvasConfig.zoom.min)

    _zoom(newLevel)
  }

  const doReset = () => {
    _zoom(canvasConfig.zoom.default)
    _centre()
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
