import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWebSocketStore = defineStore('websocket', () => {
  const isConnected = ref(false)

  const updateIsConnected = (newValue: boolean) => {
    isConnected.value = newValue
  }

  return {
    isConnected,
    updateIsConnected,
  }
})
