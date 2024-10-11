import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import keycloakService from './services/keycloak.service'
import { createI18n } from 'vue-i18n'

import en from './assets/translations/en.json'

const initApp = async () => {
  try {
    const app = createApp(App)
    const i18n = createI18n({
      availableLocales: ['en'],
      locale: 'en',
      messages: {
        en,
      },
    })

    await keycloakService.init()

    app.use(createPinia())
    app.use(i18n)
    app.use(router)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to keycloak app:', error)
  }
}

initApp()
