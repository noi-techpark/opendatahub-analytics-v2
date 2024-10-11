import Keycloak, {
  KeycloakInstance,
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
} from 'keycloak-js'

interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}

interface AuthServiceState {
  authenticated: boolean
  authToken: string | null
}

class KeycloakService {
  private keycloak: KeycloakInstance
  private state: AuthServiceState = {
    authenticated: false,
    authToken: null,
  }

  constructor() {
    const config: KeycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_AUTHORIZATION_URI,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    }

    this.keycloak = new Keycloak(config)

    this.keycloak.onAuthSuccess = this.setupAuthenticated.bind(this)
    this.keycloak.onAuthError = this.setupNonAuthenticated.bind(this)
    this.keycloak.onAuthLogout = this.setupNonAuthenticated.bind(this)
  }

  private setupAuthenticated(): void {
    this.state.authenticated = true
    this.state.authToken =
      this.keycloak.authenticated && !this.keycloak.isTokenExpired()
        ? `Bearer ${this.keycloak.token}`
        : null
  }

  private setupNonAuthenticated(): void {
    this.state.authenticated = false
    this.state.authToken = null
  }

  public async init(): Promise<void> {
    try {
      const initOptions: KeycloakInitOptions = {
        //   onLoad: 'check-sso',
        responseMode: 'query',
        silentCheckSsoRedirectUri: import.meta.env
          .KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI,
      }

      const authenticated = await this.keycloak.init(initOptions)

      if (!authenticated) {
        this.setupNonAuthenticated()
      }

      if (authenticated) {
        console.log('User is authenticated')
        this.setupAuthenticated()
      } else {
        console.log('User is not authenticated')
      }

      this.initTokenRefresh()
    } catch (error) {
      console.error('Failed to initialize authentication:', error)
    }
  }

  private initTokenRefresh(): void {
    setInterval(() => {
      this.keycloak
        .updateToken(30)
        .then(() => {
          this.setupAuthenticated()
        })
        .catch(() => {
          if (!this.keycloak.authenticated || this.keycloak.isTokenExpired()) {
            this.setupNonAuthenticated()
          }
        })
    }, 60000)
  }

  public logout(): Promise<void> {
    const options: KeycloakLogoutOptions = {
      redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
    }
    return this.keycloak.logout(options)
  }

  public login(): Promise<void> {
    const options: KeycloakLoginOptions = {
      redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
    }
    return this.keycloak.login(options)
  }

  public getToken(): string | null {
    return this.state.authToken
  }

  public isAuthenticated(): boolean {
    return this.state.authenticated
  }

  public getKeycloakInstance(): KeycloakInstance {
    return this.keycloak
  }
}

export const keycloakService = new KeycloakService()
export default keycloakService
