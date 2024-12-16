<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'

// Stores
import { useWebSocketStore } from '@stores/websocket.stores'

// Utils
import { useWebSocket } from '@utils/services/useWebSocket.services'

// Components
import SiteFooter from '@components/Site/SiteFooter/SiteFooter.vue'

const websocketStore = useWebSocketStore()
const webSocket = useWebSocket()

webSocket.connect()

watch(webSocket.isConnected, () => {
  websocketStore.updateIsConnected(webSocket.isConnected.value)
})
</script>

<template>
  <RouterView />

  <SiteFooter />
</template>
