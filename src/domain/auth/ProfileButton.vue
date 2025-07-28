<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
   <div class="profile-button" :class="bgColorClass" :title="username">
      <div class="user-icon-ct">
         <PersonIcon v-if="username == null" class="user-icon" />
         <span v-else>
            {{ letter }}
         </span>
      </div>
   </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import PersonIcon from '../../components/ui/svg/PersonIcon.vue'

type Props = {
   username?: string
   iconName?: string
}

const props = defineProps<Props>()

const { username } = toRefs(props)

const letter = computed(() =>
   username?.value != null && username.value.length > 0
      ? username.value.at(0)?.toUpperCase()
      : '?'
)

const bgColorClasses = [
   'bg-blue-500',
   'bg-gray-500',
   'bg-green',
   'bg-red-500',
   'bg-yellow',
]

const bgColorClass = computed(() => {
   if (username.value == null) {
      return 'bg-green/10'
   }

   const ascii = letter.value?.charCodeAt(0) ?? 0
   const colorIndex = ascii % bgColorClasses.length
   return bgColorClasses[colorIndex]
})
</script>

<style lang="postcss" scoped>
.profile-button {
   @apply flex size-8 items-center justify-center rounded-full text-lg font-bold text-white;

   & .user-icon-ct {
      @apply size-8 rounded-full border;
   }
}

@media (max-width: theme('screens.md')) {
   .profile-button {
   }
}
</style>
