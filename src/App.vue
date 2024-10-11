<template>
  <div class="page-ct">
    <aside class="sidebar">
      <RouterLink class="__clickable" to="/">
        <LogoIcon />
      </RouterLink>

      <div class="sidebar-links">
        <RouterLink to="/"> map </RouterLink>
        <RouterLink to="/charts"> charts </RouterLink>
        <RouterLink to="/events"> events </RouterLink>
      </div>

      <div class="sidebar-footer">
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
    </aside>

    <div class="main-ct">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import LogoIcon from './components/icons/LogoIcon.vue';
</script>

<style lang="postcss" scoped>
.page-ct {
  @apply relative flex;

  & .sidebar {
    @apply fixed top-0 bottom-0 left-0 w-[350px] z-[999] bg-white py-5 px-8 flex flex-col h-full;

    & .sidebar-footer {
      @apply mt-auto text-xs opacity-50 flex flex-col gap-1;

      & .sponsor {
        @apply flex justify-between items-center;

        & > img {
          @apply object-contain;
        }
      }
    }
  }

  & .main-ct {
    @apply ml-[350px];
  }
}
</style>
