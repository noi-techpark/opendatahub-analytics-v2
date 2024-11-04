<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <button :class="classes">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { classes } from './styles';
</script>
