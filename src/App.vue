<script setup lang="ts">
import { watch } from "vue"
import { RouterView } from "vue-router"

// Stores
import { useWebSocketStore } from "@stores/index"

// Utils
import { useWebSocket } from "@utils/services"

// Components
import { SiteHeader, SiteFooter } from "@components/Site"
import { PageWrapper } from "@components/Page"

const websocketStore = useWebSocketStore()
const webSocket = useWebSocket()

webSocket.connect()

watch(webSocket.isConnected, () => {
  websocketStore.updateIsConnected(webSocket.isConnected.value)
})
</script>

<template>
  <SiteHeader />

  <PageWrapper>
    <RouterView />
  </PageWrapper>

  <SiteFooter />
</template>
