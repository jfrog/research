<template>
  <div class="container mx-auto px-2">
    <section
      id="homeHero"
      class="home-hero flex flex-col sm:flex-row py-10 md:pt-32 md:pb-20 items-center justify-between gap-4"
    >
    
      <div class="content w-full sm:w-7/12 text-center sm:text-left">
        <h1>
          Cutting Edge Security Research to Protect the Modern Software Supply&nbsp;Chain
        </h1>
        <p class="hidden sm:block">
          {{par}}
        </p>
      </div>

      <div class="media w-full sm:w-5/12 text-center flex-col items-center justify-center">
        
        <LottieAnimation
          path="./hero-lottie.json"
        />

        <p class="block sm:hidden mt-4">
          {{par}}
        </p>
        <div class="mt-3 sm:hidden">
          <Button />
        </div>
      </div>

    </section>
  </div>
</template>

<script>
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue"; 
import Button from '~/components/Button.vue'
export default {
  data() {
    return {
      par: 'Our dedicated team of security engineers and researchers are committed to advancing software security through discovery, analysis, and exposure of new vulnerabilities and attack methods.'
    }
  },
  components: {
    Button,
    LottieAnimation
  },
  mounted() {
    // console.log(heroLottie)
  }
}

/**
<g-image
  src="~/assets/img/home-page/hero-placeholder-scan.svg"
  :immediate="true"
  class="placeholder-image mx-auto w-8/12 sm:w-full relative right-5 sm:static"
/>
 */


</script>

<style lang="scss">
  @import './../../assets/style/variables';
  .home-hero {
    .content {
      // width: 55%;
      h1 {
        width: 514px;
        max-width: 100%;
      }
      p {
        width: 404px;
        max-width: 100%;
      }
    }
  }
</style>