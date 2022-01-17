<template>
  <div>
    <div
      :class="bannerClass"
    >
      <div class="flex-col justify-between flex items-center w-full h-full">
        <div class="top">
          <div class="number mt-2">{{number}}</div>
          <div class="title px-1">{{title}}</div>
          <BannerButton :link="link" />
        </div>
        <div class="bottom mt-5 mb-4">
          Last updated on <span class="font-bold">{{dateString}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BannerButton from './BannerButton.vue'
export default {
  name: 'banner',
  data() {
    return {
      bannerClass: `sr-banner px-5 py-2 text-center bg-center bg-cover text-white bg-${this.color}`,
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
    link: {
      type: Object,
      default() {
        return {
          title: 'See All Vulnerabilities >',
          to: '/vulnerabilities'
        }
      }
    },
    date: {
      type: String,
      default() {
        return new Date()
      }
    },
  },
  computed: {
    dateString: function () {
      const d = new Date(this.date)
      const dayOfMonth = d.getDate()
      const monthName = d.toLocaleString('en-US', {month: 'short'})
      const year = d.getFullYear()
      return `${dayOfMonth} ${monthName}. ${year}`
    }
  },
  components: {
    BannerButton
  }
}
</script>

<style lang="scss">
  @import './../assets/style/variables';
  .sr-banner {
    background-image: url(~@/assets/img/backgrounds/banner-bg.png);
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
    @media (min-width: #{$md}) {
      max-width: 243px;
    }
  }
</style>