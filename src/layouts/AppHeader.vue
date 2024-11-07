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
   @apply sticky inset-x-0 top-0 z-[999] w-full select-none border-b bg-grey;

   & .__center {
      @apply gap-4;

      & .header-links {
         @apply flex items-center justify-center py-4;

         & .header-link {
            @apply rounded border border-black px-2 uppercase;
         }

         & .header-menu-icon {
            @apply ml-auto hidden;
         }
      }

      & .header-menu {
         @apply flex grow justify-between;

         & .menu-links {
            @apply flex items-center gap-2;

            & .menu-link {
               @apply mx-2 my-1 flex items-center gap-1 text-sm;
            }
         }

         & .header-profile {
            @apply flex items-center gap-2;

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
            @apply flex-col items-start gap-5 border-t pb-4 pt-2;

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
