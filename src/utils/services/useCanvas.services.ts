// Configs
import { config as canvasConfig } from "@configs/canvas.config"

// Stores
import { useCanvasStore } from "@stores/canvas.stores"

// Utils
import { setCssVar } from "@utils/helpers/dom.helpers"

export const useCanvas = () => {
  const store = useCanvasStore()

  const _centre = () => {
    if (!store.canvasSize || !store.gridSize) return

    const newX = store.canvasSize.width / 2 - store.gridSize.width / 2
    const newY = store.canvasSize.height / 2 - store.gridSize.height / 2

    store.setViewportPos({
      x: newX,
      y: newY,
    })
  }

  const _zoom = (level: number) => {
    if (!store.cssVars) return

    const modifier = 1 + level * canvasConfig.zoom.stepSize

    const newGridTileSize = Math.round(modifier * canvasConfig.grid.tileSize)
    const newGridWidth = Math.round(modifier * canvasConfig.grid.maxWidth)
    const newGridHeight = Math.round(modifier * canvasConfig.grid.maxHeight)

    // Bundle Map updates
    const newCssVars = new Map([...store.cssVars])

    newCssVars.set("--canvas-grid-tile-size-px", `${newGridTileSize}px`)
    newCssVars.set("--canvas-grid-width", `${newGridWidth}px`)
    newCssVars.set("--canvas-grid-height", `${newGridHeight}px`)

    // Update CSS vars
    setCssVar("--canvas-grid-tile-size-px", `${newGridTileSize}px`)
    setCssVar("--canvas-grid-width", `${newGridWidth}px`)
    setCssVar("--canvas-grid-height", `${newGridHeight}px`)

    // Update store
    store.setCssVars(newCssVars)
    store.setGridSize({
      width: newGridWidth,
      height: newGridHeight,
    })
    store.setZoomLevel(level)
  }

  const zoomIn = () => {
    const newLevel = Math.min(store.zoomLevel + 1, canvasConfig.zoom.max)

    _zoom(newLevel)
  }

  const zoomOut = () => {
    const newLevel = Math.max(store.zoomLevel - 1, canvasConfig.zoom.min)

    _zoom(newLevel)
  }

  const reset = () => {
    _zoom(canvasConfig.zoom.default)
    _centre()
  }

  return {
    zoomIn,
    zoomOut,
    reset,
  }
}
