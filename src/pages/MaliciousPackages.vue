<template>
  <Layout>
    <div class="container py-10">
      <g-link class="hover:text-jfrog-green transition-all" v-html="`< Back`" to="/" />
      
      <div class="flex flex-wrap gap-4 justify-between">
        <div class="left">
          <h1 class="mt-5 mb-0 pb-2"> {{title}} </h1>
          <p class="text-xs">Last Updated On <span class="font-bold"> {{latestPostDate}} </span> </p>
        </div>
        <div class="right">
          <BannerSmall
            :number="bannerNumber"
            :title="bannerTitle"
            color="gray-700"
          />
        </div>
      </div>

      <div class="posts pt-5 sm:pt-10">
        <ul class="block">
          <component
            :is="MalicListItem"
            v-for="(edge, index) in activeChunk"
            :key="index"
            :mal="edge"
          />  
        </ul>
      </div>

      <div class="pagination pt-4" v-if="postsChunks.length > 1">
        <ul class="flex gap-2 flex-wrap max-w-full">
          <li
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

<script>
import {toBlogDateStr} from '~/js/functions'
import BannerSmall from '~/components/BannerSmall'
import MalicListItem from '~/components/MalicListItem'

export default {
  data() {
    return {
      title: 'Malicious Packages',
      bannerTitle: 'Malicious packages <br> disclosed',
      postsPerPage: 10,
      currentPage: 1,
      MalicListItem: MalicListItem,
    }
  },
  computed: {
    malPackagesComp() {
      return require('./../malicious/malicious-data.json')
    },
    latestPostDate() {
      let firstPost = this.malPackagesComp[0]
      let latestDate = firstPost.date_published
      return toBlogDateStr(latestDate)
    },
    postsChunks() {
      let allPosts = [...this.malPackagesComp]
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage-1 ? this.currentPage-1 : 0
      return this.postsChunks[index]
    },
    bannerNumber() {
      return this.malPackagesComp.length.toString()
    },
  },
  components: {
    BannerSmall,
    MalicListItem
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