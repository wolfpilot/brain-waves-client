<script setup lang="ts">
import { ViewfinderCircleIcon, PlusIcon, MinusIcon } from "@heroicons/vue/24/outline"

// Utils
import { useCanvas } from "@utils/services/useCanvas.services"

export type Controls = "Reset Canvas" | "Zoom in" | "Zoom out"

const canvasService = useCanvas()

// Handlers
const handleOnReset = () => {
  canvasService.reset()
}

const handleOnZoomIn = () => {
  canvasService.zoomIn()
}

const handleOnZoomOut = () => {
  canvasService.zoomOut()
}
</script>

<template>
  <aside :class="$style.wrapper">
    <div :class="$style.btnGroup">
      <button :class="$style.btn" title="Reset canvas" @click="handleOnReset">
        <ViewfinderCircleIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>

      <button :class="$style.btn" title="Zoom in" @click="handleOnZoomIn">
        <PlusIcon :class="[$style.btnIcon, $style.btnIconStroke]" />
      </button>

      <button :class="$style.btn" title="Zoom out" @click="handleOnZoomOut">
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
