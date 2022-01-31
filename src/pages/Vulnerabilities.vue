<template>
  <Layout>
    <div class="container py-10">
      <g-link class="hover:text-jfrog-green" v-html="`< Back`" to="/" />
      
      <div class="flex flex-wrap gap-4 justify-between">
        <div class="left">
          <h1 class="mt-5 mb-0 pb-2"> {{title}} </h1>
          <p class="text-xs">Last Updated On <span class="font-bold"> {{latestPostDate}} </span> </p>
        </div>
        <div class="right">
          <BannerSmall
            :number="bannerNumber"
            :title="bannerTitle"
          />
        </div>
      </div>

      <div class="posts pt-5 sm:pt-10">
        <ul class="block">
          <component
            :is="VulnerListItem"
            v-for="edge in activeChunk"
            :key="edge.node.id"
            :vul="edge.node"
          />  
        </ul>
      </div>

      <div class="pagination pt-4">
        <ul class="flex gap-2 flex-wrap max-w-full">
          <li
            class=""
            v-for="(chunk, index) in postsChunks"
            :key="index"
          >
            <button
              @click="currentPage = index+1"
              :class="getPaginationClass(index+1)"
            >
              {{index+1}}
            </button>
          </li>
        </ul>
      </div>

    </div>
  </Layout>
</template>


<static-query>
query Blog {
  posts: allPost (
    sortBy: "date_published",
    order: DESC,
  filter: {
    type: {eq: "vulnerability" }
  }
  ){
    edges {
      node {
        id
        path
        title
        description
        date_published
        xray_id 
        vul_id
        severity
        discovered_by
        type
      }
    }
  }
}
</static-query>


<script>
import {toBlogDateStr} from '~/js/functions'
import BannerSmall from '~/components/BannerSmall'
import VulnerListItem from '~/components/VulnerListItem'
export default {
  name: 'Vulnerabilities',
  data() {
    return {
      title: 'Software Vulnerabilities',
      bannerTitle: 'Vulnerabilities <br> discovered',
      postsPerPage: 10,
      currentPage: 1,
      VulnerListItem: VulnerListItem
    }
  },
  computed: {
    latestPostDate() {
      let allPosts = [...this.$static.posts.edges]
      let firstPost = allPosts[0]
      let latestDate = firstPost.node.date_published
      return toBlogDateStr(latestDate)
    },
    postsChunks() {
      let allPosts = [...this.$static.posts.edges]
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage-1 ? this.currentPage-1 : 0
      return this.postsChunks[index]
    },
    bannerNumber() {
      return this.$static.posts.edges.length.toString()
    },
  },
  components: {
    BannerSmall,
    VulnerListItem
  },
  mounted() {
    // let 
  },
  methods: {
    chunks: function(array, size) {
      var results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    },
    getPaginationClass: function(pageNum) {
      
      let calculatedClass = 'w-8 h-8 text-sm flex items-center justify-center hover:bg-jfrog-green hover:text-white transition-all'
      
      const 
        normalClass = ' bg-gray-300 text-black',
        activeClass = ' bg-jfrog-green text-white'
      
      if (pageNum === this.currentPage) {
        calculatedClass += activeClass
      } else {
        calculatedClass += normalClass
      }

      return calculatedClass
    }
  },
  metaInfo() {
    return {
      title: `Software Vulnerabilities | `,
      meta: [
        {
          name: "title",
          content: `Software Vulnerabilities | JFrog Security Research`,
        },
        {
          name: "description",
          content: `Latest security vulnerabilities discovered. Our security researchers and engineers collaborate to create advanced vulnerability scanners to help the community`,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com' + '/vulnerabilities/',
        },
      ],
    };
  },

}

</script>

<style lang="scss">
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 1s;
  }
  .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
</style>