// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

declare namespace NodeJS {
   interface ProcessEnv {
      VITE_KEYCLOAK_AUTHORIZATION_URI: string
      VITE_KEYCLOAK_REALM: string
      VITE_KEYCLOAK_CLIENT_ID: string
      VITE_KEYCLOAK_REDIRECT_URI: string
      VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI: string
   }
}
