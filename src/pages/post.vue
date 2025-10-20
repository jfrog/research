<template>
  <Layout>
    <div class="container py-10">
      <g-link class="hover:text-jfrog-green"  to="/" >
        < Back
        </g-link>
      
      <div class="flex flex-wrap gap-4 justify-between">
        <div class="left">
          <h1 class="mt-5 mb-0 pb-2"> {{title}} </h1>
          <p class="text-xs">Last Updated On <span class="font-bold"> {{latestPostDate}} </span> </p>
        </div>

      </div>

      <div class="posts pt-5 sm:pt-10">
        <ul class="block">
          <component
            :is="RealTimePostItem"
            v-for="(edge, index) in activeChunk"
            :key="index"
            :postObj="edge"
          />  
        </ul>
      </div>

      <div class="pagination pt-4" v-if="postsChunks.length>1">
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
excerpt
tag
img
path
}
}
}
}
</static-query>


<script>
import {toBlogDateStr} from '~/js/functions'
import BannerSmall from '~/components/BannerSmall'
import RealTimePostItem from '~/components/RealTimePostItem.vue'

export default {
  name: 'realTimePosts',
  data() {
    return {
      title: 'JFrog Security Real Time Posts',
      bannerTitle: 'Latest from JFrog Security',
      postsPerPage: 10,
      currentPage: 1,
      RealTimePostItem: RealTimePostItem
    }
  },
  computed: {
    remoteLatestPosts() {
      let realTimePost = [...this.$static.RealTimePost.edges.map((edge)=>edge.node)]

      // Step 2: Sort the merged array by date_published
      const SortedPosts = realTimePost.sort((a, b) => {
        return  new Date(b.date) - new Date(a.date) ;
      });

      return SortedPosts;
    },
    latestPostDate() {
      let allPosts = this.remoteLatestPosts;
      let firstPost = allPosts[0]
      let latestDate = firstPost.date
      return toBlogDateStr(latestDate)
    },
    postsChunks() {
      let allPosts = this.remoteLatestPosts;
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage-1 ? this.currentPage-1 : 0
      return this.postsChunks[index]
    },
    bannerNumber() {
      return this.$static.RealTimePost.edges.length.toString()
    },
  },
  components: {
    BannerSmall,
    RealTimePostItem: RealTimePostItem

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
      title: `JFrog Security Real Time Posts`,
      meta: [
        {
          name: "title",
          content: `JFrog Security Real Time Posts`,
        },
        {
          name: "description",
          content: `Latest security Real Time post `,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com' + '/realtime/',
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