<template>
  <div class="layout">
    <Header />
    <main class="container mx-auto px-4 md:px-8">
      <slot />
    </main>
  </div>
</template>

<script>
  import Header from "~/components/Header.vue";
  import "@fontsource/roboto"
  export default {
    components: {
      Header,
    },
  };
</script>

<style lang="scss">
@import './../assets/style/variables';
  body {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.375;
    color: $gray;
  }
  .small {
    font-size: 14px;
  }
</style>
