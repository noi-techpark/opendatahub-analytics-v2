// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
   url: import.meta.env.VITE_KEYCLOAK_AUTHORIZATION_URI,
   realm: import.meta.env.VITE_KEYCLOAK_REALM,
   clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

keycloak
   .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: import.meta.env
         .VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI,
      pkceMethod: 'S256',
   })
   .then(() => {
      setInterval(() => {
         keycloak.updateToken(70).catch(() => {
            if (keycloak.token) {
               // Application has still an invalid token. Let's clear it.
               keycloak.clearToken()
            }
         })
      }, 6000)
   })

const appBaseUrl = new URL(
   import.meta.env.BASE_URL || '/',
   window.location.origin
).toString()

const originalLogin = keycloak.login.bind(keycloak)
const originalRegister = keycloak.register.bind(keycloak)
const originalLogout = keycloak.logout.bind(keycloak)
const originalCreateAccountUrl = keycloak.createAccountUrl.bind(keycloak)

type LoginOptions = Parameters<typeof keycloak.login>[0]
type RegisterOptions = Parameters<typeof keycloak.register>[0]
type LogoutOptions = Parameters<typeof keycloak.logout>[0]
type AccountOptions = Parameters<typeof keycloak.createAccountUrl>[0]

keycloak.login = (options?: LoginOptions) =>
   originalLogin({ redirectUri: appBaseUrl, ...(options || {}) })
keycloak.register = (options?: RegisterOptions) =>
   originalRegister({ redirectUri: appBaseUrl, ...(options || {}) })
keycloak.logout = (options?: LogoutOptions) =>
   originalLogout({ redirectUri: appBaseUrl, ...(options || {}) })
keycloak.createAccountUrl = (options?: AccountOptions) =>
   originalCreateAccountUrl({ redirectUri: appBaseUrl, ...(options || {}) })
