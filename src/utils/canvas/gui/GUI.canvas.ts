import { type TpChangeEvent, Pane } from "tweakpane"

// Configs
import { config } from "@configs/debug.config"

// Stores
import { type GUIStore, useGUIStore } from "@stores/gui.stores"

export interface GUI {
  init: () => Promise<void>
}

class GUIImpl implements GUI {
  #pane: Pane | null
  #guiStore: GUIStore | null

  constructor() {
    this.#pane = null
    this.#guiStore = null
  }

  #handleSurfaceChange = (e: TpChangeEvent<boolean>) => {
    if (!this.#guiStore) return

    this.#guiStore.setIsSurfaceEnabled(e.value)
  }

  #handleCornersChange = (e: TpChangeEvent<boolean>) => {
    if (!this.#guiStore) return

    this.#guiStore.setIsCornersEnabled(e.value)
  }

  #handleCrosshairChange = (e: TpChangeEvent<boolean>) => {
    if (!this.#guiStore) return

    this.#guiStore.setIsCrosshairEnabled(e.value)
  }

  #handleCentreChange = (e: TpChangeEvent<boolean>) => {
    if (!this.#guiStore) return

    this.#guiStore.setIsCentreEnabled(e.value)
  }

  #setup = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDebugEnabled = urlParams.get("debug")

    if (isDebugEnabled !== "true") return

    this.#pane = new Pane({
      title: "Grid",
      expanded: true,
    })

    this.#pane.addBinding(config, "surface").on("change", this.#handleSurfaceChange)
    this.#pane.addBinding(config, "corners").on("change", this.#handleCornersChange)
    this.#pane.addBinding(config, "crosshair").on("change", this.#handleCrosshairChange)
    this.#pane.addBinding(config, "centre").on("change", this.#handleCentreChange)
  }

  public init = () => {
    this.#guiStore = useGUIStore()

    this.#setup()

    return Promise.resolve()
  }
}

export default GUIImpl
