<template>
  <div class="container mx-auto px-2">
    <section
      id="homeHero"
      class="home-hero flex flex-col sm:flex-row py-10 md:pt-0 md:pb-0 items-center gap-8"
    >
    
      <div class="content w-full sm:w-7/12 text-center sm:text-left">
        <h1>
          Cutting Edge Security Research to Protect the Modern Software Supply&nbsp;Chain
        </h1>
        <p class="hidden sm:block pb-1">
          {{par}}
        </p>
        <div class="hidden sm:block">
          <LatestFromBlogCVE/>

      </div>

      </div>

      <div class="media w-full px-0 text-center flex-col items-center justify-center">
        <div class="cls-fix">
          <LottieAnimation
            path="./hero-lottie.json"
          />
        </div>

        <p class="block sm:hidden mt-4">
          {{par}}
        </p>
        <div class="mt-3 sm:hidden">
          <Button />
        </div>
        <div class=" sm:hidden">
          <LatestFromBlogCVE/>

        </div>
      </div>


    </section>
  </div>
</template>



<script>
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue";
import LatestFromBlogCVE from "~/components/LatestFromBlogCVE.vue";

import Button from '~/components/Button.vue'
export default {
  data() {
    return {
      par: 'Our dedicated team of security engineers and researchers are committed to advancing software security through discovery, analysis, and exposure of new vulnerabilities and attack methods.'
    }
  },
  components: {
    Button,
    LottieAnimation,
    LatestFromBlogCVE
  },
}

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
  .cls-fix {
    height: calc(100vw - 30px) !important;
    @media screen and (min-width: 640px) {
      height: 221.5px !important;
    }
    @media screen and (min-width: 1024px) {
      height: 100% !important;
    }
  }
</style>

