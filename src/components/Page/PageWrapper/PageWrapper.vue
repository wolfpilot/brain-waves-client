<template>
  <main :class="$style.wrapper">
    <slot />
  </main>
</template>

<style lang="css" module>
.wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: var(--size-siteHeaderHeight);
  padding-bottom: var(--size-siteFooterHeight);
}
</style>
