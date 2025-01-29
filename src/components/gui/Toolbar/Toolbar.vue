<script setup lang="ts">
import { ViewfinderCircleIcon, PlusIcon, MinusIcon } from "@heroicons/vue/24/outline"

// Assets
import { CursorIcon, SquareIcon, CircleIcon } from "@components/icons"

// Stores
import { useCanvasStore } from "@stores/canvas.stores"

// Constants
import { TOOLBAR_TOOLS, TOOLBAR_CONTROLS } from "@constants/toolbar.constants"

// Utils
import { useCanvas } from "@utils/services"

const canvasStore = useCanvasStore()
const canvasService = useCanvas()

const handleZoomIn = () => {
  if (!canvasStore.viewportPos) return

  canvasService.doZoomIn(canvasStore.viewportPos)
}

const handleZoomOut = () => {
  if (!canvasStore.viewportPos) return

  canvasService.doZoomOut(canvasStore.viewportPos)
}
</script>

<template>
  <aside :class="$style.wrapper">
    <div :class="$style.btnGroup">
      <button
        :class="[$style.btn, canvasStore.activeTool === TOOLBAR_TOOLS.select && $style.isActive]"
        :title="TOOLBAR_TOOLS.select"
        @click="canvasService.doSelect"
      >
        <CursorIcon :class="[$style.btnIcon, $style.btnIconFill]" />
      </button>

      <button
        :class="[$style.btn, canvasStore.activeTool === TOOLBAR_TOOLS.rectangle && $style.isActive]"
        :title="TOOLBAR_TOOLS.rectangle"
        @click="canvasService.doRectangle"
      >
        <SquareIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>
      <button
        :class="[$style.btn, canvasStore.activeTool === TOOLBAR_TOOLS.circle && $style.isActive]"
        :title="TOOLBAR_TOOLS.circle"
        @click="canvasService.doCircle"
      >
        <CircleIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>
    </div>

    <div :class="$style.btnGroup">
      <button :class="$style.btn" :title="TOOLBAR_CONTROLS.reset" @click="canvasService.doReset">
        <ViewfinderCircleIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>

      <button :class="$style.btn" :title="TOOLBAR_CONTROLS.zoomIn" @click="handleZoomIn">
        <PlusIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>

      <button :class="$style.btn" :title="TOOLBAR_CONTROLS.zoomOut" @click="handleZoomOut">
        <MinusIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>
    </div>
  </aside>
</template>

<style lang="css" module>
.wrapper {
  --btnSize: 36px;
  --btnIconSize: 24px;

  position: absolute;
  top: var(--spacing-default);
  left: var(--spacing-default);
}

.btnGroup {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--c-accent-4-50);
  border-radius: var(--border-radius-default);

  &:not(:last-of-type) {
    margin-bottom: var(--spacing-default);
  }
}

.btn {
  width: var(--btnSize);
  height: var(--btnSize);
  padding: 0;
  background-color: var(--c-accent-4-10);
  outline: none;
  border: none;

  &:hover,
  &:focus-within {
    background-color: var(--c-accent-4-30);
  }

  &.isActive {
    background-color: var(--c-accent-4);
  }
}

.btnIcon {
  width: var(--btnIconSize);
  height: var(--btnIconSize);
}

.btnIconStroke {
  stroke: var(--c-white-80);
}

.btnIconFill {
  fill: var(--c-white-80);
}
</style>
