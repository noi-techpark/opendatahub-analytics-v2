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

            <div class="header-auto-refresh-mobile">
               <Switch
                  :model-value="isAutoRefreshEnabled"
                  @update:model-value="toggleAutoRefresh"
                  class="auto-refresh-toggle"
               >
                  <div class="auto-refresh-content">
                     <span class="auto-refresh-text">Autorefresh Data</span>
                  </div>
               </Switch>
            </div>

            <div class="header-menu-icon">
               <CloseIcon v-if="props.isMenuOpen" @click="toggleMenu" />
               <MenuIcon v-else @click="toggleMenu" />
            </div>
         </div>

         <div
            class="header-menu"
            :class="{ 'max-md:!hidden': !props.isMenuOpen }"
         >
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

            <div class="header-auto-refresh">
               <Switch
                  :model-value="isAutoRefreshEnabled"
                  @update:model-value="toggleAutoRefresh"
                  class="auto-refresh-toggle"
               >
                  <div class="auto-refresh-content">
                     <span class="auto-refresh-text">Autorefresh Data</span>
                  </div>
               </Switch>
            </div>

            <Divider class="header-divider" />

            <div class="header-profile">
               <MenuUserSection />

               <Divider class="header-divider" />

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
   </header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import H from '../components/ui/tags/H.vue'
import OpenInNewIcon from '../components/ui/svg/OpenInNewIcon.vue'
import MenuUserSection from '../domain/auth/MenuUserSection.vue'
import MenuIcon from '../components/ui/svg/MenuIcon.vue'
import CloseIcon from '../components/ui/svg/CloseIcon.vue'
import Switch from '../components/ui/Switch.vue'
import RefreshIcon from '../components/ui/svg/RefreshIcon.vue'
import Divider from '../components/ui/Divider.vue'
import { useAutoRefreshStore } from '../stores/auto-refresh'

type Props = {
   isMenuOpen: boolean
}
type Emit = {
   toggleMenu: [boolean]
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emit>()

const { t } = useI18n()

const autoRefreshStore = useAutoRefreshStore()
const { isAutoRefreshEnabled } = storeToRefs(autoRefreshStore)
const { toggleAutoRefresh } = autoRefreshStore

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

         & .header-auto-refresh-mobile {
            @apply ml-auto hidden;

            & .auto-refresh-toggle {
               @apply mr-3 flex items-center gap-2;

               & .auto-refresh-content {
                  @apply flex flex-row-reverse items-center gap-2;

                  & .auto-refresh-text {
                     @apply text-sm;
                  }
               }
            }
         }

         & .header-menu-icon {
            @apply hidden;
         }
      }

      & .header-menu {
         @apply flex grow items-center gap-4;

         & .menu-links {
            @apply flex flex-grow items-center gap-2;

            & .menu-link {
               @apply mx-2 my-1 flex items-center gap-1 text-sm;
            }
         }

         & .header-auto-refresh {
            @apply flex items-center;

            & .auto-refresh-toggle {
               @apply flex items-center gap-2;

               & .auto-refresh-content {
                  @apply flex flex-row-reverse items-center gap-2;

                  & .auto-refresh-text {
                     @apply text-sm;
                  }
               }
            }
         }

         & .header-divider {
            @apply my-0 h-8 w-px;
         }

         & .header-profile {
            @apply flex items-center gap-4;

            & .odh-logo {
               @apply aspect-square h-8;
            }
         }
      }
   }
}

@media (max-width: theme('screens.md')) {
   .app-header-ct {
      @apply flex-col;

      & .app-header {
         @apply flex-col px-3;

         & .header-links {
            @apply w-full;

            & .header-auto-refresh-mobile {
               @apply flex;
            }

            & .header-menu-icon {
               @apply block;
            }
         }

         & .header-menu {
            @apply flex-col items-start justify-start gap-4 border-t pb-4 pt-2;

            & .menu-links {
               @apply w-full flex-col;

               & .menu-link {
                  @apply mx-0 w-full py-2;
               }
            }

            & .header-auto-refresh {
               @apply hidden;
            }

            & .header-divider {
               @apply hidden;
            }

            & .header-profile {
               @apply mt-2 w-full justify-between;

               & .odh-logo {
                  @apply h-8;
               }
            }
         }
      }
   }
}
</style>
