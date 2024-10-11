declare namespace NodeJS {
  interface ProcessEnv {
    VUE_APP_KEYCLOAK_AUTHORIZATION_URI: string
    VUE_APP_KEYCLOAK_REALM: string
    VUE_APP_KEYCLOAK_CLIENT_ID: string
    VUE_APP_KEYCLOAK_REDIRECT_URI: string
    VUE_APP_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI: string
  }
}
