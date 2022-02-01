<template>
  <section class="green-radial-gradient py-10 sm:py-33 border-b-2 border-white">
    <div class="container mx-auto px-2">
      <div class="flex flex-wrap justify-between items-center pb-10">
        <h2 class="text-white"> {{title}} </h2>    
        <BannerButton :link="link" rel="noopener" target="_blank" />
      </div>

      <div class="latest-security-posts" v-if="remoteLatestPosts.length">
        <div class="grid overflow-hidden grid-cols-1 sm:grid-cols-3 grid-rows gap-2">
          <div 
            class="box row-span-1 hidden sm:block first:block"
            v-for="(p, index) in remoteLatestPosts"
            :key="p.img"  
          >
            <SecurityBlogPreview :postObj="p" :imageIndex="index.toString()" />
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
export default {
  data() {
    return {
      title: 'Latest from JFrog\'s Security Blog',
      link: {
        title: 'JFrog’s Security Blog >',
        to: 'https://jfrog.com/blog/tag/security-research/'
      },
    }
  },
  components: {
    BannerButton,
    SecurityBlogPreview
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
