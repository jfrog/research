<template>
  <div class="layout">
    <Header />

    <slot />

    <Footer />
  </div>
</template>

<script>
  import Header from "~/components/Header.vue";
  import Footer from "~/components/Footer.vue";
  
  import "@fontsource/roboto"
  import "@fontsource/roboto/700.css"

  export default {
    components: {
      Header,
      Footer,
    },
  };
</script>

<style lang="scss">
@import './../assets/style/variables';
@import './../assets/style/custom';
</style>
