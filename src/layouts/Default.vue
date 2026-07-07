<template>
  <div
    :class="[
      classStr,
      'min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200',
    ]"
  >
    <Header />

    <main>
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script>
  import Header from "~/components/Header.vue";
  import Footer from "~/components/Footer.vue";
  
  import "@fontsource/roboto"
  import "@fontsource/roboto/700.css"
  import "@fontsource/roboto/500.css"

  export default {
    components: {
      Header,
      Footer,
    },
    props: {
      classStr: {
        type: String,
        default: 'layout'
      }
    },
    metaInfo() {
      return {
        link: [
          {
            rel: "alternate",
            type: "application/rss+xml",
            title: "JFrog Security Research RSS",
            href: "https://research.jfrog.com/rss.xml",
          },
        ],
      };
    },
  };
</script>

<style lang="scss">
@import './../assets/style/variables';
@import './../assets/style/custom';
</style>
