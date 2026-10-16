<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <DialogCustom :is-open="visible" @close="dismiss">
      <template #title>
         {{
            t(
               hasErrors
                  ? 'components.alarm-config.error-title'
                  : 'components.alarm-config.warning-title'
            )
         }}
      </template>
      <template #description>
         {{
            t(
               hasErrors
                  ? 'components.alarm-config.error-description'
                  : 'components.alarm-config.warning-description'
            )
         }}
      </template>
      <template #body>
         <ul class="problems">
            <li
               v-for="(problem, index) in problems"
               :key="index"
               class="problem"
            >
               <span class="severity" :class="problem.severity">
                  {{
                     t(`components.alarm-config.severity-${problem.severity}`)
                  }}
               </span>
               <div class="details">
                  <p class="message">{{ problem.message }}</p>
                  <p v-if="problem.lines.length > 0" class="location">
                     {{
                        t(
                           problem.column
                              ? 'components.alarm-config.location-column'
                              : 'components.alarm-config.location',
                           {
                              lines: formatLines(problem.lines),
                              column: problem.column,
                           }
                        )
                     }}
                  </p>
               </div>
            </li>
         </ul>
         <p class="file">
            {{ t('components.alarm-config.config-file', { url: configUrl }) }}
         </p>
         <Button center grow :value="t('common.close')" @click="dismiss" />
      </template>
   </DialogCustom>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import DialogCustom from '../dialog/DialogCustom.vue'
import Button from '../Button.vue'
import { useLayerDataStore } from '../../../stores/layer-data'
import {
   getDefaultAlarmConfigUrl,
   type AlarmConfigProblem,
} from '../../../utils/alarm-config-loader'

/** Beyond this the list belongs in the file, not in the dialog. */
const MAX_LINES = 5

const { t } = useI18n()
const { alarmConfigProblems } = storeToRefs(useLayerDataStore())
const configUrl = getDefaultAlarmConfigUrl()

const problems = computed<AlarmConfigProblem[]>(
   () => alarmConfigProblems.value ?? []
)
const hasErrors = computed(() =>
   problems.value.some((problem) => problem.severity === 'error')
)
// The configuration is retried on every refresh: dismissing must survive the
// retries of the same failure, while a new failure has to reopen the dialog.
const signature = computed(() => JSON.stringify(problems.value))
const dismissed = ref<string | null>(null)
const visible = computed(
   () => problems.value.length > 0 && signature.value !== dismissed.value
)

const dismiss = () => {
   dismissed.value = signature.value
}

const formatLines = (lines: number[]) => {
   const shown = lines.slice(0, MAX_LINES).join(', ')
   const hidden = lines.length - MAX_LINES
   return hidden > 0
      ? `${shown} ${t('components.alarm-config.more-lines', { n: hidden })}`
      : shown
}
</script>

<style lang="postcss" scoped>
.problems {
   @apply flex max-h-72 flex-col gap-2 overflow-y-auto rounded border bg-grey p-3;

   & .problem {
      @apply flex items-start gap-2;

      & .severity {
         @apply mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none;

         &.error {
            @apply bg-red-500 text-white;
         }

         &.warning {
            @apply bg-yellow text-black-2;
         }
      }

      & .details {
         @apply flex flex-col gap-0.5 text-left;

         & .message {
            @apply text-sm text-black-2;
         }

         & .location {
            @apply text-xs text-grey-3;
         }
      }
   }
}

.file {
   @apply break-all text-xs text-grey-3;
}
</style>
