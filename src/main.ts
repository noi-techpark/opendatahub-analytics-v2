import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import keycloakService from './services/keycloak.service'

const initApp = async () => {
  try {
    const app = createApp(App)

    await keycloakService.init()

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to keycloak app:', error)
  }
}

initApp()
