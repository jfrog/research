<template>
  <section class="detection-edge text-white pt-10 sm:pt-32 pb-10 sm:pb-20">
    <div class="container">
      <div class="flex flex-wrap justify-center sm:justify-between flex-row items-center gap-3 justify-between">
        <div class="content flex-initial">
          <g-image
            src="~/assets/img/icons/xray.svg"
            height="58"
            width="103"
            :alt="title"
          />
          <h2 class="text-white mt-8">{{title}}</h2>
          <p class="my-3">{{description}}</p>
          <BannerButton textColor="white" bgColor="jfrog-green" :link="link" />
        </div>

        <g-image
          src="~/assets/img/home-page/detection-edge.svg"
          height="313"
          width="356"
          :alt="title"
          class="flex-initial"
        />

      </div>
    </div>
  </section>
</template>

<script>
import BannerButton from './../../components/BannerButton.vue'
export default {
  data() {
    return {
      title: 'The JFrog Detection Edge',
      description: 'The JFrog Security research team is part of the group behind JFrog Xray, enhancing its unique vulnerability database and utilizing patented technology to quickly detect unknown security issues in both open source and proprietary code.',
      link: {
        title: 'Learn more about Xray',
        to: 'https://jfrog.com/xray/'
      },
    }
  },
  components: {
    BannerButton,
  }
}
</script>

<style lang="scss">
  @import './../../assets/style/variables.scss';
  .detection-edge {
    background: radial-gradient(161.86% 161.86% at 51.37% 0%, #242037 0%, #000000 100%);
    h1 {
      width: 514px;
      max-width: 100%;
    }
    p {
      max-width: 508px;
    }
  }
</style>