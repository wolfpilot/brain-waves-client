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
  private ioStore: IoStore
  private canvasElem: HTMLCanvasElement

  constructor() {
    this.ioStore = useIoStore()

    this.canvasElem = document.getElementsByTagName("canvas")[0]
  }

  private _handleWheel = (e: WheelEvent) => {
    const newOffset = e.deltaY > 0 ? this.ioStore.wheelOffsetY + 1 : this.ioStore.wheelOffsetY - 1

    this.ioStore.setWheelOffsetY(newOffset)
  }

  private _handleMouseDown = (e: MouseEvent) => {
    const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

    this.ioStore.setActiveMouseButtons(activeBtn, true)
  }

  private _handleMouseUp = (e: MouseEvent) => {
    const activeBtn = MouseKeyToValue[e.button as MouseBtnKeys]

    this.ioStore.setActiveMouseButtons(activeBtn, false)
  }

  private _handleMouseMove = useThrottleFn((e: MouseEvent) => {
    this.ioStore.setMousePos({
      x: e.clientX,
      y: e.clientY,
    })
  }, THROTTLE_MOUSE_MOVE_MS)

  private _handleResize = useDebounceFn(() => {
    this.ioStore.setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, DEBOUNCE_RESIZE_MS)

  private _bindListeners = () => {
    useEventListener(this.canvasElem, "wheel", this._handleWheel)
    useEventListener(this.canvasElem, "mousedown", this._handleMouseDown)
    useEventListener(window, "mouseup", this._handleMouseUp)
    useEventListener(window, "mousemove", this._handleMouseMove)
    useEventListener(window, "resize", this._handleResize)
  }

  public init = () => {
    this._bindListeners()
  }
}

export default IoManagerImpl
