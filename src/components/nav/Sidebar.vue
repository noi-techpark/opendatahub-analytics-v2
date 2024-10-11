<template>
  <aside class="sidebar-ct">
    <div class="sidebar-top">
      <RouterLink class="__clickable" to="/">
        <LogoIcon />
      </RouterLink>

      <div class="sidebar-links">
        <RouterLink
          class="sidebar-link"
          :class="{ selected: page === 'map' }"
          to="/"
        >
          {{ $t('components.sidebar.map') }}
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ selected: page === 'charts' }"
          to="/charts"
        >
          {{ $t('components.sidebar.charts') }}
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ selected: page === 'events' }"
          to="/events"
        >
          {{ $t('components.sidebar.events') }}
        </RouterLink>
      </div>

      <Divider />
    </div>

    <div class="sidebar-content">
      <SidebarMapContent v-if="page === 'map'" />
      <SidebarChartsContent v-if="page === 'charts'" />
      <SidebarEventsContent v-if="page === 'events'" />
    </div>

    <div class="sidebar-footer">
      <div class="auth-ct">
        <Divider />
        <div class="auth">
          <button class="__clickable" @click="handleLogin">
            {{ $t('common.login') }}
          </button>
          <button class="__clickable" @click="handleLogout">
            {{ $t('common.logout') }}
          </button>
        </div>
      </div>

      <div class="legal-ct">
        <div class="sponsor">
          <img src="@/assets/img/noi-logo.png" />
          <img src="@/assets/img/life-logo.png" />
          <img src="@/assets/img/brennerlec-logo.png" />
        </div>
        <a
          class="__clickable"
          href="https://noi.bz.it/it"
          title="noi-techpark"
          target="_blank"
        >
          © 2018-{{ new Date().getFullYear() }}
          <span class="underline font-semibold">NOI Techpark</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import keycloakService from '../../services/keycloak.service'
import LogoIcon from '../icons/LogoIcon.vue'
import { computed } from 'vue'
import SidebarMapContent from './SidebarMapContent.vue'
import SidebarChartsContent from './SidebarChartsContent.vue'
import SidebarEventsContent from './SidebarEventsContent.vue'
import Divider from '../ui/Divider.vue'

const route = useRoute()
// const isAuthenticated = keycloakService.isAuthenticated()

const handleLogin = async () => {
  await keycloakService.login()
}

const handleLogout = async () => {
  await keycloakService.logout()
}

const page = computed((): 'map' | 'charts' | 'events' | undefined => {
  switch (route.path) {
    case '/':
      return 'map'
    case '/charts':
      return 'charts'
    case '/events':
      return 'events'
  }
})
</script>

<style lang="postcss" scoped>
.sidebar-ct {
  @apply fixed top-0 bottom-0 left-0 w-[350px] z-[999] bg-white shadow-xl flex flex-col overflow-y-auto;

  & .sidebar-top {
    @apply pt-5 px-8 flex flex-col gap-5;

    & .sidebar-links {
      @apply flex justify-between;

      & .sidebar-link {
        @apply border rounded-lg px-2 py-1 border-primary text-primary transition-all font-medium;

        &:hover {
          @apply bg-primary/10;
        }

        &.selected {
          @apply text-white bg-primary;
        }
      }
    }
  }

  & .sidebar-content {
    @apply flex-grow py-5 px-8;
  }

  & .sidebar-footer {
    @apply mt-auto;

    & .auth-ct {
      @apply flex flex-col gap-5 pb-5 px-8;

      & .auth {
        @apply flex gap-5;
      }
    }

    & .legal-ct {
      @apply text-xs flex flex-col gap-1 py-5 px-8 opacity-50 bg-gray-100;

      & .sponsor {
        @apply flex justify-between items-center;

        & > img {
          @apply object-contain;
        }
      }
    }
  }
}
</style>
