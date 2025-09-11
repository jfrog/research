<template>
  <div>
    <div
      :class="bannerClass"
    >
      <div class="flex-col justify-between flex items-center w-full h-full">
        <div class="top">
          <div class="number mt-2">{{number}}</div>
          <div class="title px-1">{{title}}</div>
          <BannerButton
            :gaa="gaa"
            :gal="gal"
            :link="link"
          />
        </div>
        <div v-if="dateString" class="bottom mt-5 mb-4">
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
    gaa: {
      type: String,
      default: 'Vulnerabilities'
    },
    gal: {
      type: String,
      default: 'See All Vulnerabilities'
    },
    link: {
      type: Object,
      default() {
        return {
          title: 'See All Vulnerabilities >',
          to: '/vulnerabilities/'
        }
      }
    },
    date: {
      type: String,
    },
  },
  computed: {
    dateString: function () {
      if(this.date){
      const d = new Date(this.date)
      const dayOfMonth = d.getDate()
      const monthName = d.toLocaleString('en-US', {month: 'short'})
      const year = d.getFullYear()
      return `${dayOfMonth} ${monthName}. ${year}`
      }
      return ''
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
    @media (min-width: #{$md}) {
      max-width: 243px;
      min-height: 153px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @media (max-width: #{$md}) {
      width: 343px;
    }
  }
</style>