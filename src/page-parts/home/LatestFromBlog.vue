<template>
  <section>

    <ImageTitle
        :title="title"
    >
      <g-image
          src="~/assets/img/home-page/jfrog-security.svg"
          :immediate="true"
          class="placeholder-image flex-auto w-1"
          alt="Software Vulnerabilities"
      />
    </ImageTitle>

    <div class="container mx-auto px-2 pb-20">
      <div class="flex flex-col lg:flex-row gap-12">
          <div class=" latest-security-posts" v-if="remoteLatestPosts.length">
            <div class="flex overflow-hidden flex-col gap-12 lg:gap-5">
              <div
                  class="box row-span-1  sm:block first:block"
                  v-for="(p, index) in remoteLatestPosts"
                  :key="p.img"
              >
                <SecurityBlogPreview :postObj="p" :imageIndex="index.toString()"/>
              </div>
            </div>
          </div>
        <div class="banner-col lg:pl-12 justify-center flex flex-col flex items-center w-full h-full mb-4 lg:mb-0">
          <div class="js-banner px-10 lg:px-6 py-12 text-center bg-center bg-cover bg-jfrog-green h-full w-full">
            <BannerButton
                :link="link"
                rel="noopener"
                target="_blank"
                data-gac="Links back to JFrog"
                data-gaa="JFrog Blog"
                data-gal="JFrog’s Security Blog"
            />
          </div>
        </div>
        </div>
      </div>
  </section>
</template>

<static-query>
query {
metadata {
latestPostsJSON
}
}
</static-query>


<script>
import BannerButton from './../../components/BannerButton.vue'
import SecurityBlogPreview from './../../components/SecurityBlogPreview'
import ImageTitle from "../../components/ImageTitle";

export default {
  data() {
    return {
      title: 'Latest from JFrog\'s Security Blog',
      link: {
        title: 'See All JFrog Security Blogs >',
        to: 'https://jfrog.com/blog/tag/security-research/'
      },
    }
  },
  components: {
    BannerButton,
    SecurityBlogPreview,
    ImageTitle,


  },
  computed: {
    remoteLatestPosts() {
      const latestPostsJSON = this.$static.metadata.latestPostsJSON
      const parsed = JSON.parse(latestPostsJSON)
      return parsed
    }
  }
}
</script>

<static-query>
query {
metadata {
latestPostsJSON
}
}
</static-query>

<style lang="scss">
@import '../../assets/style/variables';
.js-banner {
  background-image: url(~@/assets/img/backgrounds/jfrog-security-bg.png);
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
  @media (max-width: #{$md}) {
    width: 343px;
  }
}
</style>