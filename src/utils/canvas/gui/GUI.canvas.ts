import { Pane } from "tweakpane"

// Configs
import { config } from "@configs/debug.config"

export interface GUI {
  init: () => Promise<void>
}

class GUIImpl implements GUI {
  #pane: Pane | null

  constructor() {
    this.#pane = null
  }

  #setup = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDebugEnabled = urlParams.get("debug")

    if (isDebugEnabled !== "true") return

    this.#pane = new Pane({
      title: "Grid",
      expanded: true,
    })

    this.#pane.addBinding(config, "surface")
    this.#pane.addBinding(config, "corner")
    this.#pane.addBinding(config, "crosshair")
    this.#pane.addBinding(config, "centre")
  }

  public init = () => {
    this.#setup()

    return Promise.resolve()
  }
}

export default GUIImpl
