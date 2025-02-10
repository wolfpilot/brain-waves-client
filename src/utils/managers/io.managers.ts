import { useEventListener, useDebounceFn, useThrottleFn } from "@vueuse/core"

// Stores
import { useIoStore, type IoStore } from "@stores/io.stores"

// Constants
import { MouseKeyToValue, type MouseBtnKeys } from "@constants/keys.constants"

export interface IoManager {
  init: () => void
}

// Setup
const DEBOUNCE_RESIZE_MS = 500
const THROTTLE_MOUSE_MOVE_MS = 1000 / 60 // aka 60Hz

class IoManagerImpl implements IoManager {
  #ioStore: IoStore
  #canvasElem: HTMLCanvasElement

  constructor() {
    this.#ioStore = useIoStore()

    this.#canvasElem = document.getElementsByTagName("canvas")[0]
  }

  public init = () => {
    this.#bindListeners()
  }

  #bindListeners = () => {
    useEventListener(this.#canvasElem, "wheel", this.#handleWheel)
    useEventListener(this.#canvasElem, "mousedown", this.#handleMouseDown)
    useEventListener(window, "mouseup", this.#handleMouseUp)
    useEventListener(window, "mousemove", this.#handleMouseMove)
    useEventListener(window, "resize", this.#handleResize)
  }

  #handleWheel = (e: WheelEvent) => {
    const newOffset = e.deltaY > 0 ? this.#ioStore.wheelOffsetY + 1 : this.#ioStore.wheelOffsetY - 1

    this.#ioStore.setWheelOffsetY(newOffset)
  }

  #handleMouseDown = (e: MouseEvent) => {
    const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

    this.#ioStore.setActiveMouseButtons(activeBtn, true)
  }

  #handleMouseUp = (e: MouseEvent) => {
    const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

    this.#ioStore.setActiveMouseButtons(activeBtn, false)
  }

  #handleMouseMove = useThrottleFn((e: MouseEvent) => {
    this.#ioStore.setMousePos({
      x: e.clientX,
      y: e.clientY,
    })
  }, THROTTLE_MOUSE_MOVE_MS)

  #handleResize = useDebounceFn(() => {
    this.#ioStore.setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, DEBOUNCE_RESIZE_MS)
}

export default IoManagerImpl
