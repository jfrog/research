<template>
  <div
    :class="bannerClass"
  >
    <div class="justify-between flex- flex items-center">
      <div class="number mt-2">{{number}}</div>
      <div class="title text-left px-4" v-html="title"></div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'BannerSmall',
  data() {
    return {
      bannerClass: `sr-banner sr-banner-small px-5 py-2 text-center bg-center bg-cover text-white bg-${this.color}`,
    }
  },
  props: {
    color: {
      type: String,
      default: 'jfrog-green'
    },
    number: {
      type: String,
      default: '500'
    },
    title: {
      type: String,
      default: 'Vulnerabilities discovered'
    },
  },
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .sr-banner {
    background-image: url(~@/assets/img/backgrounds/banner-bg.webp);
    .number {
      font-size: 42px;
      font-weight: 700;
    }
    .title {
      font-size: 22px;
    }
    button {
      font-size: 16px;
    }
    .bottom {
      font-size: 14px;
    }
    &.sr-banner-small {
      max-width: unset;
    }
  }
</style>