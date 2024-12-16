import { ref, onUnmounted } from 'vue'

// Constants
import { WS_ENDPOINT_URL } from '@/constants/api.constants'

export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null)
  const messages = ref<string[]>([])
  const isConnected = ref<boolean>(false)

  const connect = (): void => {
    if (ws.value) {
      console.warn('WebSocket already connected.')
      return
    }

    ws.value = new WebSocket(WS_ENDPOINT_URL)

    ws.value.onopen = () => {
      if (!ws.value) return

      isConnected.value = true
      ws.value.send('start')

      console.log('WebSocket connection opened.')
    }

    ws.value.onclose = () => {
      isConnected.value = false

      console.log('WebSocket connection closed.')
    }

    ws.value.onmessage = (event: MessageEvent) => {
      messages.value.push(event.data)

      console.log('WebSocket message received:', event.data)
    }

    ws.value.onerror = (error: Event) => {
      console.error('WebSocket error:', error)
    }
  }

  // Disconnect the WebSocket
  const disconnect = (): void => {
    if (!ws.value) {
      console.warn('Cannot disconnect, WebSocket is not connected.')

      return
    }

    ws.value.close()
    ws.value = null
  }

  // Send a message via WebSocket
  const sendMessage = (message: string): void => {
    if (!isConnected.value || !ws.value) {
      console.warn('Cannot send message, WebSocket is not connected.')

      return
    }

    ws.value.send(message)
  }

  // Clean up the WebSocket when the component using this service is destroyed
  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    isConnected,
    messages,
    sendMessage,
  }
}
