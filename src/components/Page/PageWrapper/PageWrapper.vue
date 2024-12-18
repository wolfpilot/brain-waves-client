<template>
  <main :class="$style.wrapper">
    <slot />
  </main>
</template>

<style lang="css" module>
.wrapper {
  flex: 1;
  background: var(--p-cross);
  background-size: 60px 60px;
}
</style>
