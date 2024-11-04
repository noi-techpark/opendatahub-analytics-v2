<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="app-header">
    <div class="__center">
      <div class="header-links">
        <RouterLink to="/" class="header-link">
          <H tag="h2">{{ t('layouts.app-header.title') }}</H>
        </RouterLink>

        <div class="header-menu-icon">
          <IconClose v-if="props.isMenuOpen" @click="toggleMenu" />
          <IconMenu v-else @click="toggleMenu" />
        </div>
      </div>

      <div class="header-menu" :class="{ '!hidden': props.isMenuOpen }">
        <div class="menu-links">
          <a
            href="https://github.com/noi-techpark/odh-docs/wiki/Data-Browser"
            target="_blank"
            class="menu-link"
          >
            {{ t('layouts.app-header.how-to') }}
            <OpenInNewIcon />
          </a>
          <a
            href="https://opendatahub.com/contact"
            target="_blank"
            class="menu-link"
          >
            {{ t('layouts.app-header.contact') }}
            <OpenInNewIcon />
          </a>
        </div>

        <div class="header-profile">
          <MenuUserSection />
          <a href="https://opendatahub.com" target="_blank">
            <img
              :alt="t('layouts.app-header.logo')"
              class="odh-logo"
              src="/logo-open-data-hub-black.svg"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import IconMenu from '../components/tmp/components/svg/IconMenu.vue'
import IconClose from '../components/tmp/components/svg/IconClose.vue'
import H from '../components/ui/tags/H.vue'
import OpenInNewIcon from '../components/ui/svg/OpenInNewIcon.vue'
import MenuUserSection from '../domain/auth/MenuUserSection.vue'

type Props = {
  isMenuOpen: boolean
}
type Emit = {
  toggleMenu: [boolean]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

const { t } = useI18n()

function toggleMenu() {
  emit('toggleMenu', !props.isMenuOpen)
}
</script>

<style lang="postcss" scoped>
.app-header {
  @apply sticky top-0 inset-x-0 z-[999] w-full select-none bg-grey border-b border-stroke;

  & .__center {
    @apply gap-4;

    & .header-links {
      @apply flex items-center justify-center py-4;

      & .header-link {
        @apply rounded-small border border-black px-2 uppercase;
      }

      & .header-menu-icon {
        @apply ml-auto hidden;
      }
    }

    & .header-menu {
      @apply flex justify-between grow;

      & .menu-links {
        @apply flex text-black-2 items-center gap-2;

        & .menu-link {
          @apply flex gap-1 items-center text-sm mx-2 my-1;
        }
      }

      & .header-profile {
        @apply flex gap-2 items-center;

        & .odh-logo {
          @apply aspect-square h-6;
        }
      }
    }
  }
}

@media (max-width: theme('screens.md')) {
  .app-header {
    @apply flex-col;

    & .__center {
      @apply flex-col;

      & .header-links {
        @apply w-full;

        & .header-menu-icon {
          @apply block;
        }
      }

      & .header-menu {
        @apply flex-col pt-2 pb-4 border-t border-stroke gap-5 items-start;

        & .menu-links {
          @apply flex-col;

          & .menu-link {
            @apply mx-0;
          }
        }

        & .header-profile {
          @apply w-full justify-between;

          & .odh-logo {
            @apply h-8;
          }
        }
      }
    }
  }
}
</style>
