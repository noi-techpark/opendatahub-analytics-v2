<template>
  <aside class="sidebar">
    <RouterLink class="__clickable" to="/">
      <LogoIcon />
    </RouterLink>

    <div class="auth-ct">login</div>

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
</template>

<script setup lang="ts">
import LogoIcon from '../icons/LogoIcon.vue'
</script>

<style lang="postcss" scoped>
.sidebar {
  @apply fixed top-0 bottom-0 left-0 w-[350px] z-[999] bg-white py-5 px-8 flex flex-col h-full;

  & .sidebar-footer {
    @apply absolute bottom-0 inset-x-0 text-xs flex flex-col gap-1 py-5 px-8 opacity-50 bg-gray-100;

    & .sponsor {
      @apply flex justify-between items-center;

      & > img {
        @apply object-contain;
      }
    }
  }
}
</style>
