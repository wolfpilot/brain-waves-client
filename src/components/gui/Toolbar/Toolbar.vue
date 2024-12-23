<script setup lang="ts">
import { useCanvasStore } from "@stores/canvas.stores"

const canvasStore = useCanvasStore()

const onCentreCanvasClick = () => {
  canvasStore.actionCentre()
}
</script>

<template>
  <aside :class="$style.wrapper">
    <button @click="onCentreCanvasClick">Centre canvas</button>
  </aside>
</template>

<style lang="css" module>
.wrapper {
  position: absolute;
  top: var(--spacing-default);
  left: var(--spacing-default);
}
</style>
