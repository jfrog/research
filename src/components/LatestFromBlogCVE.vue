<template>
  <section class="gray-bg mt-12">
    <div class="flex flex-col sm:block">
      <div class="bg-jfrog-green inline-block font-bold px-3 py-1 text-sm uppercase mb-2">
        <a   :href="link"
             rel="noopener"
             target="_blank"
             data-gac="Links back to JFrog"
             data-gaa="JFrog Blog"
             data-gal="JFrog’s CVE Blog"
              class="text-white"> {{title}} </a>
      </div>

      <div class="latest-cve-posts px-3.5 pb-2" v-if="remoteLatestPosts.length">
        <div class="flex overflow-hidden flex-col justify-center sm:flex-row sm:justify-start">
          <div
            class="box row-span-1"
            v-for="(p, index) in remoteLatestPosts"
            :key="index"
          >
            <CVEBlogPreview :postObj="p" :index="index"   />

          </div>

        </div>
      </div>

    </div>
  </section>
</template>

<static-query>
query {
  metadata {
    latestCVEPostsJSON
  }
}
</static-query>


<script>
import CVEBlogPreview from './CVEBlogPreview'
export default {
  data() {
    return {
      title: 'Latest CVE Analyses',
      link: 'https://jfrog.com/blog/tag/cve-analysis/'
    }
  },
  components: {
    CVEBlogPreview
  },
  computed: {
    remoteLatestPosts() {
      const latestCVEPostsJSON = this.$static.metadata.latestCVEPostsJSON
      const parsed = JSON.parse(latestCVEPostsJSON)
      return parsed
    }
  }
}
</script>


<style lang="scss">
.home-hero {
  .gray-bg{
    background-color: #F6F6F6;
    max-width: 513px;

  }

}
</style>