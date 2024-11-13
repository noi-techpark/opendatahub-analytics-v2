<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <main class="charts-add-view">
      <H tag="h1">{{ $t('views.charts-add.title') }}</H>

      <div class="input-cards-ct">
         <div class="input-card first">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.provider') }}</H>
                  <P>{{ $t('views.charts-add.provider-description') }}</P>
               </div>
               <Select :text="$t('views.charts-add.provider-select')"></Select>
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.dataset') }}</H>
                  <P>{{ $t('views.charts-add.dataset-description') }}</P>
               </div>
               <Select :text="$t('views.charts-add.dataset-select')"></Select>
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.station') }}</H>
                  <P>{{ $t('views.charts-add.station-description') }}</P>
               </div>
               <Select :text="$t('views.charts-add.station-select')"></Select>
            </div>
            <Switch v-model="stationFromMap">
               <P>{{ $t('views.charts-add.station-map') }}</P>
            </Switch>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.datatype') }}</H>
                  <P>{{ $t('views.charts-add.datatype-description') }}</P>
               </div>
               <Select :text="$t('views.charts-add.datatype-select')"></Select>
            </div>
         </div>

         <div class="input-card last">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.period') }}</H>
                  <P>{{ $t('views.charts-add.period-description') }}</P>
               </div>
               <Select :text="$t('views.charts-add.period-select')"></Select>
            </div>
         </div>

         <div class="buttons-ct">
            <Button outline @click="cancel">{{ $t('common.cancel') }}</Button>
            <Button @click="save">{{ $t('views.charts-add.save') }}</Button>
         </div>
      </div>
   </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '../components/ui/Button.vue'
import H from '../components/ui/tags/H.vue'
import P from '../components/ui/tags/P.vue'
import Switch from '../components/ui/Switch.vue'
import { ref } from 'vue'
import Select from '../components/ui/Select.vue'

const router = useRouter()
const stationFromMap = ref<boolean>(false)

const cancel = () => {
   router.replace(router?.options.history?.state?.back || '/')
}

const save = () => {
   // TODO: save the time series
}
</script>

<style lang="postcss" scoped>
.charts-add-view {
   @apply flex flex-col gap-2;

   & .input-cards-ct {
      @apply flex max-w-[700px] flex-col;

      & .input-card {
         @apply flex w-full flex-col gap-2 border border-b-0 p-4;

         &.first {
            @apply rounded-t;
         }

         &.last {
            @apply rounded-b border-b;
         }

         & .input-card-header {
            @apply flex justify-between gap-2;
         }
      }

      & .buttons-ct {
         @apply mt-4 flex gap-2 self-end;
      }
   }
}

@media (max-width: theme('screens.md')) {
   .charts-view {
   }
}
</style>
