<script setup lang="ts">
import { ViewfinderCircleIcon, PlusIcon, MinusIcon } from "@heroicons/vue/24/outline"

// Assets
import { SquareIcon } from "@components/icons"

// Stores
import { useCanvasStore } from "@stores/canvas.stores"

const canvasStore = useCanvasStore()
</script>

<template>
  <aside :class="$style.wrapper">
    <div :class="$style.btnGroup">
      <button :class="$style.btn" title="Rectangle" @click="canvasStore.actionAddRectangle">
        <SquareIcon :class="$style.btnIcon" />
      </button>
    </div>

    <div :class="$style.btnGroup">
      <button :class="$style.btn" title="Reset canvas" @click="canvasStore.actionReset">
        <ViewfinderCircleIcon :class="$style.btnIcon" />
      </button>

      <button :class="$style.btn" title="Zoom in" @click="canvasStore.actionZoomIn">
        <PlusIcon :class="$style.btnIcon" />
      </button>

      <button :class="$style.btn" title="Zoom out" @click="canvasStore.actionZoomOut">
        <MinusIcon :class="$style.btnIcon" />
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
  border: 1px solid var(--c-accent-4-50);
  border-radius: var(--border-radius-default);

  &:not(:last-of-type) {
    margin-bottom: var(--spacing-default);
  }
}

.btn {
  background: none;
  outline: none;
  border: none;

  width: var(--btnSize);
  height: var(--btnSize);
  padding: 0;
  background: var(--c-accent-4-10);

  &:hover,
  &:focus-within {
    background-color: var(--c-accent-4-20);
  }
}

.btnIcon {
  width: var(--btnIconSize);
  height: var(--btnIconSize);
  stroke: var(--c-white-80);
}
</style>
