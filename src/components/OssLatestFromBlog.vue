<template>
  <section class=" oss-latest-post inline-block "v-if="remoteLatestPosts.length">
    <div class="container ">
        <h2 class="text-black capitalize"> {{post.title}}<br> Related Blogs</h2>


      <div class="latest-oss-posts flex-col" v-if="remoteLatestPosts.length">
          <div
            class="oss-box  hidden sm:block first:block"
            v-for="(p, index) in remoteLatestPosts"
            :key="index"

          >
            <OssBlogPreview :postObj="p" :imageIndex="index.toString()" :category="post.title"/>
          </div>
      </div>

    </div>
  </section>
</template>

<static-query>
query {
  metadata {
latestLog4ShellPostsJSON,
latestSpringShellPostsJSON,
latestNpmToolsPostsJSON

  }

}
</static-query>


<script>
import BannerButton from './BannerButton.vue'
import OssBlogPreview from './OssBlogPreview'
export default {
  props: {
    post: {
      type: Object,
      default() {
        return {
          title: 'shell',
        }
      }
    },
  },
  components: {
    BannerButton,
    OssBlogPreview
  },
  computed: {
    remoteLatestPosts() {
      if(this.post.title==='log4shell') {
        const latestPostsJSON = this.$static.metadata.latestLog4ShellPostsJSON
        const parsed = JSON.parse(latestPostsJSON)
        return parsed

      }else if(this.post.title==='springshell'){
        const latestPostsJSON = this.$static.metadata.latestSpringShellPostsJSON
        const parsed = JSON.parse(latestPostsJSON)
        return parsed

      }else if(this.post.title==='npm-tools'){
        const latestPostsJSON = this.$static.metadata.latestNpmToolsPostsJSON
        const parsed = JSON.parse(latestPostsJSON)
        return parsed
      }else{
        return '';
      }
    }
  }
}
</script>

<static-query>
query {
  metadata {
latestLog4ShellPostsJSON,
latestSpringShellPostsJSON,
latestNpmToolsPostsJSON
}

}
</static-query>
<style lang="scss">
@import './../assets/style/variables';

.oss-latest-post{
  background-color:#F0F0F0 ;
  padding: 40px 8px 20px ;
  height: fit-content;
  position: sticky;
  top:0;



  h2{
    line-height: 34px;
    font-size: 25px;
    margin-bottom: 35px;

  }
  @media screen and (min-width: #{$sm}) {
    padding: 40px 8px 0px;
    max-width: 279px;


  }
  .oss-box{
    margin-bottom: 3rem;
  }
  }
</style>