<script setup lang="ts">
import { RouterLink } from "vue-router"

// Constants
import { clientRoutes } from "@constants/routes.constants"
</script>

<template>
  <header :class="$style.wrapper">
    <RouterLink :class="$style.logoLink" :to="clientRoutes.home.url">
      <img :class="$style.logoImg" src="/svg/logo.svg" />
      <span :class="$style.logoText">BrainWaves</span>
    </RouterLink>
  </header>
</template>

<style lang="css" module>
.wrapper {
  display: flex;
  height: var(--size-siteHeaderMobHeight);
  padding: var(--spacing-small) var(--spacing-default);
  background: var(--c-page-background);
  border-bottom: 1px solid var(--c-dGrey);

  @media only screen and (min-width: 768px) {
    height: var(--size-siteHeaderDeskHeight);
  }
}

.logoLink {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  max-height: 100%;
  text-decoration: none;

  &:hover,
  &:focus-within {
    .logoText {
      background-position: 100% center;
    }
  }

  @media only screen and (min-width: 768px) {
    gap: var(--spacing-default);
  }
}

.logoImg {
  --logo-img-size: 32px;

  width: var(--logo-img-size);
  height: var(--logo-img-size);

  @media only screen and (min-width: 768px) {
    --logo-img-size: 42px;
  }
}

.logoText {
  background: var(--g-diag-accent);
  background-size: 400% auto;
  color: transparent;
  background-clip: text;
  font-size: var(--heading-xs-font-size);
  font-weight: var(--font-weight-light);
  transition: background-position var(--anim-duration-verySlow) var(--anim-ease-cubic);

  @media only screen and (min-width: 768px) {
    font-size: var(--heading-s-font-size);
  }
}
</style>
