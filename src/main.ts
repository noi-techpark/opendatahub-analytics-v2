// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import './assets/main.css'
import './assets/font.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
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

    app.use(createPinia())
    app.use(i18n)
    app.use(router)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to keycloak app:', error)
  }
}

initApp()
