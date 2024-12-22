<script setup lang="ts">
import { computed } from "vue"
import { storeToRefs } from "pinia"

// Stores
import { useWebSocketStore } from "@stores/index"

const websocketStore = useWebSocketStore()
const { isConnected } = storeToRefs(websocketStore)

const theme = computed(() => ({
  statusIndicatorBgColor: isConnected.value ? "var(--c-success)" : "var(--c-error)",
}))
</script>

<template>
  <footer :class="$style.wrapper">
    <div :class="$style.status">
      <div :class="$style.statusText">
        {{ isConnected ? "Connected" : "Disconnected" }}
      </div>
      <div :class="$style.statusIndicator" />
    </div>
  </footer>
</template>

<style lang="css" module>
.wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: var(--size-siteFooterHeight);
  margin-top: auto;
  padding: var(--spacing-small) var(--spacing-default);
  background: var(--c-page-background);
  border-top: 1px solid var(--c-dGrey);
}

.status {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  margin-left: auto;
}

.statusIndicator {
  --indicator-size: var(--spacing-small);

  width: var(--indicator-size);
  height: var(--indicator-size);
  border-radius: 50%;
  background-color: v-bind("theme.statusIndicatorBgColor");
  transition: background-color var(--anim-ease-cubic) var(--anim-duration-medium);
}

.statusText {
  font-size: var(--copy-s-font-size);
}
</style>
