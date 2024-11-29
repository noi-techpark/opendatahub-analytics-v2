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
               <SelectPopover
                  v-model="selection.provider"
                  :text="$t('views.charts-add.provider-select')"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-dataprovider')
                  "
                  :loading="loadingState.provider"
                  :options="providerOptions"
               />
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.dataset') }}</H>
                  <P>{{ $t('views.charts-add.dataset-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.dataset"
                  :text="$t('views.charts-add.dataset-select')"
                  :options="datasetOptions"
                  :loading="loadingState.dataset"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-dataset')
                  "
               />
            </div>
         </div>

         <div class="input-card">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.station') }}</H>
                  <P>{{ $t('views.charts-add.station-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.station"
                  :text="$t('views.charts-add.station-select')"
                  :options="stationOptions"
                  :loading="loadingState.station"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-station')
                  "
               />
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
               <SelectPopover
                  v-model="selection.datatype"
                  :text="$t('views.charts-add.datatype-select')"
                  :options="datatypeOptions"
                  :loading="loadingState.datatype"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-datatype')
                  "
               />
            </div>
         </div>

         <div class="input-card last">
            <div class="input-card-header">
               <div class="input-card-text">
                  <H tag="h2">{{ $t('views.charts-add.period') }}</H>
                  <P>{{ $t('views.charts-add.period-description') }}</P>
               </div>
               <SelectPopover
                  v-model="selection.period"
                  :text="$t('views.charts-add.period-select')"
                  :options="periodOptions"
                  :loading="loadingState.period"
                  :search-label-placeholder="
                     $t('views.charts-add.search-for-period')
                  "
               />
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
import { computed, onMounted, ref, watch } from 'vue'
import SelectPopover from '../components/ui/popover/SelectPopover.vue'
import { useFetch } from '@vueuse/core'
import { SelectOption } from '../types/select'

const router = useRouter()
const stationFromMap = ref<boolean>(false)
const loadingState = ref({
   provider: false,
   dataset: false,
   station: false,
   datatype: false,
   period: false,
})

const providers = ref<{ sorigin: string }[]>([])
const datasets = ref<{ stype: string }[]>([])
const stations = ref<{ sname: string }[]>([])
const datatypes = ref<{ tname: string; tdescription: string }[]>([])

const selection = ref({
   provider: '',
   dataset: '',
   station: '',
   datatype: '',
   period: '',
})

const providerOptions = computed<SelectOption[]>(() => {
   return providers.value.map((item) => ({
      label: item.sorigin,
      value: item.sorigin,
   }))
})

const datasetOptions = computed<SelectOption[]>(() => {
   return datasets.value.map((item) => ({
      label: item.stype,
      value: item.stype,
   }))
})

const stationOptions = computed<SelectOption[]>(() => {
   return stations.value.map((item) => ({
      label: item.sname,
      value: item.sname,
   }))
})

const datatypeOptions = computed(() => {
   return datatypes.value.map((item) => ({
      label: item.tdescription,
      value: item.tname,
   }))
})

const periodOptions = computed(() => {
   return []
})

const cancel = () => {
   router.replace(router?.options.history?.state?.back || '/')
}

const save = () => {
   // TODO: save the time series
}

const useFetchProviderOptions = async () => {
   loadingState.value.provider = true

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/%2A?limit=-1&offset=0&select=sorigin&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   providers.value = data.value.data

   loadingState.value.provider = false
}

const useFetchDatasetOptions = async () => {
   loadingState.value.dataset = true

   selection.value.dataset = ''

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/%2A?limit=-1&offset=0&select=stype&where=sorigin.eq.${selection.value.provider}&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   datasets.value = data.value.data

   loadingState.value.dataset = false
}

const useFetchStationOptions = async () => {
   // TODO: implement infinite scroll

   loadingState.value.station = true

   selection.value.station = ''

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}?limit=100&offset=0&select=sname&where=sorigin.eq.${selection.value.provider}&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   stations.value = data.value.data

   loadingState.value.station = false
}

const useFetchDatatypeOptions = async () => {
   // TODO: implement infinite scroll

   loadingState.value.datatype = true

   selection.value.datatype = ''

   const dataUrl = `${import.meta.env.VITE_ODH_MOBILITY_API_URI}/flat/${selection.value.dataset}/*?limit=100&offset=0&select=tname,tdescription&where=sorigin.eq.${selection.value.provider}&shownull=false&distinct=true`

   const { data } = await useFetch(dataUrl).json()
   datatypes.value = data.value.data

   loadingState.value.datatype = false
}

onMounted(() => {
   useFetchProviderOptions()
})

watch(
   () => selection.value.provider,
   (newVal) => {
      if (!newVal) return

      useFetchDatasetOptions()
   }
)

watch(
   () => selection.value.dataset,
   (newVal) => {
      if (!newVal) return

      useFetchStationOptions()
   }
)

watch(
   () => selection.value.station,
   (newVal) => {
      if (!newVal) return

      useFetchDatatypeOptions()
   }
)
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
