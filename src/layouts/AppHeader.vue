<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <header class="app-header-ct">
      <div class="app-header">
         <div class="header-links">
            <RouterLink to="/" class="header-link">
               <H tag="h2">{{ t('layouts.app-header.title') }}</H>
            </RouterLink>

            <div class="header-menu-icon">
               <CloseIcon v-if="props.isMenuOpen" @click="toggleMenu" />
               <MenuIcon v-else @click="toggleMenu" />
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
               <a
                  href="https://europa.provincia.bz.it/it/informazione-e-visibilita-fesr"
               >
                  <img
                     :alt="t('layouts.app-header.logo')"
                     class="eu-logo"
                     src="https://databrowser.impact.digital.noi.bz.it/EFRmod.png"
                  />
               </a>
            </div>
         </div>
      </div>
   </header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import H from '../components/ui/tags/H.vue'
import OpenInNewIcon from '../components/ui/svg/OpenInNewIcon.vue'
import MenuUserSection from '../domain/auth/MenuUserSection.vue'
import MenuIcon from '../components/ui/svg/MenuIcon.vue'
import CloseIcon from '../components/ui/svg/CloseIcon.vue'

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
.app-header-ct {
   @apply sticky inset-x-0 top-0 z-[1] w-full select-none border-b bg-grey;

   & .app-header {
      @apply m-auto mx-auto flex w-full gap-4 px-6;

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
            & .eu-logo {
               @apply aspect-auto h-6;
            }
         }
      }
   }
}

@media (max-width: theme('screens.md')) {
   .app-header-ct {
      @apply flex-col;

      & .app-header {
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
               & .eu-logo {
                  @apply h-8;
               }
            }
         }
      }
   }
}
</style>
