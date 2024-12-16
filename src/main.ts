import '@assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// import VueSocketIOExt from 'vue-socket.io-extended'
// import io from 'socket.io-client'

import App from './App.vue'
import router from './router'

const app = createApp(App)
// const socket = io('ws://localhost:8080', {
//   transports: ['websocket'],
// })

app.use(createPinia())
app.use(router)

app.mount('#app')
// app.use(VueSocketIOExt, socket)
