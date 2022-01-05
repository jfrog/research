<template>
  <div class="layout">
    <Header />

    <slot />

  </div>
</template>

<script>
  import Header from "~/components/Header.vue";
  import "@fontsource/roboto"
  import "@fontsource/roboto/700.css"
  export default {
    components: {
      Header,
    },
  };
</script>

<style lang="scss">
@import './../assets/style/variables';
@import './../assets/style/custom';
</style>
