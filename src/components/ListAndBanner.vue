<template>
  <div class="container mx-auto px-2 pb-20">
    <section>

<!--      <h2 class="mb-2 sm:mb-5 md:mb-10">{{title}}</h2>-->

      <div class="flex flex-col lg:pl-10 lg:flex-row-reverse gap-3 lg:gap-9">
        <div class="banner-col justify-center flex mb-4 lg:mb-0">
          <Banner
            :color="banner.color"
            :number="banner.number"
            :title="banner.title"
            :link="banner.link"
            :date="bannerDate"
            :gaa="gaa"
            :gal="gal"
          />
        </div>
        <div class="list-col flex-auto">
          <component :is="list"></component>
        </div>
      </div>

    </section>
  </div>
</template>

<script>
import Banner from './Banner.vue'
export default {
  props: {
    title: {
      default: "gell"
    },
    banner: {
      type: Object,
      default() {
        return {
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
                to: '/vulnerabilities/'
              }
            }
          },
        }
      }
    }, //object
    bannerDate: {
      type: String,
      default: '01-01-2011'
    },
    gaa: {
      type: String,
      default: 'Vulnerabilities'
    },
    gal: {
      type: String,
      default: 'See All Vulnerabilities'
    },
    list: {
      type: [String, Object],
      default: 'div'
    } //component
  },
  components: {
    Banner
  },
}
</script>