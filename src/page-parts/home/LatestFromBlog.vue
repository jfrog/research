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
      <div class="flex flex-col lg:pl-10 lg:flex-row gap-12">
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
<!--          <div class="banner-col mt-10 justify-center flex mb-4 lg:mb-0">-->
<!--            <Banner-->
<!--                :color="realTimePostBanner.color"-->
<!--                :number="realTimePostBanner.number"-->
<!--                :title="realTimePostBanner.title"-->
<!--                :link="realTimePostBanner.link"-->

<!--            />-->
<!--          </div>-->
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
<static-query>
query realTimePostsMain {
RealTimePost: allRealTimePost (
sortBy: "date",
order: DESC,
filter: {
type: {eq: "realTimePost" }
}
){
edges {
node {
description
title
date
type
tag
img
path
excerpt
minutes

}
}
}
}
</static-query>

<script>
import BannerButton from './../../components/BannerButton.vue'
import SecurityBlogPreview from './../../components/SecurityBlogPreview'
import ImageTitle from "../../components/ImageTitle";
import RealTimePostItem from "../../components/RealTimePostItem.vue";
import Banner from "../../components/Banner.vue";

export default {
  data() {
    return {
      title: 'Latest from JFrog\'s Security',
      link: {
        title: 'See All JFrog Security Blogs >',
        to: 'https://jfrog.com/blog/tag/security-research/'
      },
      realTimePostBanner: {
        color: "jfrog-green",
        number: "",
        title: "",
        link: {
          title: 'See All JFrog Security Real-Time Posts >',
          to: '/post/'
        },
      },


    }
  },
  components: {
    Banner,
    BannerButton,
    SecurityBlogPreview,
    ImageTitle,
    RealTimePostItem,


  },
  computed: {
    remoteLatestPosts() {
      const latestPostsJSON = this.$static.metadata.latestPostsJSON
      const parsed = JSON.parse(latestPostsJSON)
      let realTimePost = [...this.$static.RealTimePost.edges.map((edge)=>edge.node)]
      const merged = [...parsed, ...realTimePost];

      // Step 2: Sort the merged array by date_published
      const mergedAndSortedPosts = merged.sort((a, b) => {
        return  new Date(b.date) - new Date(a.date) ;
      });

      return mergedAndSortedPosts.slice(0,5)
    }
  }
}
</script>

<static-query>
query {
metadata {
latestPostsJSON
}
RealTimePost: allRealTimePost (
sortBy: "date",
order: DESC,
filter: {
type: {eq: "realTimePost" }
}
){
edges {
node {
description
title
date
type
tag
img
path
minutes
excerpt
}
}
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