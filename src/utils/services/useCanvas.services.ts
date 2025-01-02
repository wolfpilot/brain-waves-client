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

    const newTileSize = Math.round(modifier * canvasConfig.grid.tileSize)
    const newMaxWidth = Math.round(modifier * canvasConfig.dimensions.maxWidth)
    const newMaxHeight = Math.round(modifier * canvasConfig.dimensions.maxHeight)

    // Bundle Map updates
    const newCssVars = new Map([...store.cssVars])

    newCssVars.set("--canvas-bg-tile-size-px", `${newTileSize}px`)
    newCssVars.set("--canvas-max-width", `${newMaxWidth}px`)
    newCssVars.set("--canvas-max-height", `${newMaxHeight}px`)

    // Update CSS vars
    setCssVar("--canvas-bg-tile-size-px", `${newTileSize}px`)
    setCssVar("--canvas-max-width", `${newMaxWidth}px`)
    setCssVar("--canvas-max-height", `${newMaxHeight}px`)

    // Update store
    store.setCssVars(newCssVars)
    store.setGridSize({
      width: newMaxWidth,
      height: newMaxHeight,
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
