<template>
  <aside class="sidebar-ct">
    <div class="sidebar-top">
      <RouterLink class="__clickable" to="/">
        <LogoIcon />
      </RouterLink>

      <div class="sidebar-links">
        <RouterLink
          class="sidebar-link"
          :class="{ selected: route.path === '/' }"
          to="/"
        >
          Map Overview
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ selected: route.path === '/charts' }"
          to="/charts"
        >
          Charts
        </RouterLink>
        <RouterLink
          class="sidebar-link"
          :class="{ selected: route.path === '/events' }"
          to="/events"
        >
          Events
        </RouterLink>
      </div>

      <div class="divider" />
    </div>

    <div class="sidebar-content">dynamic content for {{ route.path }}</div>

    <div class="sidebar-footer">
      <div class="auth-ct">
        <button class="__clickable" @click="handleLogin">Login</button>
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

const route = useRoute()

const handleLogin = async () => {
  await keycloakService.login()
}
</script>

<style lang="postcss" scoped>
.sidebar-ct {
  @apply fixed top-0 bottom-0 left-0 w-[350px] z-[999] bg-white shadow-xl flex flex-col;

  & .sidebar-top {
    @apply py-5 px-8 flex flex-col gap-5;

    & .sidebar-links {
      @apply flex justify-between;

      & .sidebar-link {
        @apply border rounded-lg rounded-tr-none px-2 py-1 border-primary text-primary transition-all;

        &:hover {
          @apply bg-primary/10;
        }

        &.selected {
          @apply text-white bg-primary;
        }
      }
    }

    & .divider {
      @apply h-[1px] w-full bg-primary/10;
    }
  }

  & .sidebar-content {
    @apply flex-grow py-5 px-8;
  }

  & .sidebar-footer {
    @apply mt-auto;

    & .auth-ct {
      @apply py-2 px-8;
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
