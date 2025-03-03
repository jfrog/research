<template>
  <Layout>
    <div class="container py-10">
      <div class="left main-title">
        <h1 class="mb-0 pb-5"> {{ title }} </h1>
      </div>

      <div class="mt-posts pt-5 sm:pt-10">
        <div class="mt-posts-list">
          <component
              :is="ModelThreatsListItem"
              v-for="edge in activeChunk"
              :key="edge.node.id"
              :vul="edge.node"
          />
        </div>
      </div>

      <div class="pagination pt-4" v-if="totalPages > 1">
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
              {{ index + 1 }}
            </button>
          </li>
        </ul>
      </div>

    </div>
  </Layout>
</template>


<static-query>
query modelThreatsPostsMain {
modelThreatsPosts: allModelThreatsPost (
sortBy: "date_published",
order: DESC,
filter: {
type: {eq: "modelThreat" }
}
){
edges {
node {
path
title
description
type
}
}
}
}
</static-query>

<script>
import {toBlogDateStr} from '~/js/functions'
import ModelThreatsListItem from '~/components/ModelThreatsListItem'

export default {
  name: 'Model Threats',
  data() {
    return {
      title: 'Machine Learning Model Threat Categories',
      postsPerPage: 10,
      currentPage: 1,
      ModelThreatsListItem: ModelThreatsListItem
    }
  },
  computed: {

    postsChunks() {
      let allPosts = [...this.$static.modelThreatsPosts.edges]
      const postsChunks = this.chunks(allPosts, this.postsPerPage)
      return postsChunks
    },
    activeChunk() {
      const index = this.currentPage - 1 ? this.currentPage - 1 : 0
      return this.postsChunks[index]
    },
    // Calculate the total number of pages
    totalPages() {
      return Math.ceil(this.$static.modelThreatsPosts.edges.length / this.postsPerPage);
    },

  },
  components: {
    ModelThreatsListItem
  },
  mounted() {
    // let 
  },
  methods: {
    chunks: function (array, size) {
      var results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    },
    getPaginationClass: function (pageNum) {

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
      title: `Model Threats`,
      meta: [
        {
          name: "title",
          content: `Model Threats`,
        },
        {
          name: "description",
          content: `Latest security vulnerabilities discovered. Our security researchers and engineers collaborate to create advanced vulnerability scanners to help the community`,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: 'https://research.jfrog.com' + '/model-threats/',
        },
      ],
    };
  },

}

</script>

<style lang="scss">
@import './../assets/style/variables';

.list-item {
  display: inline-block;
  margin-right: 10px;
}

.list-enter-active, .list-leave-active {
  transition: all 1s;
}

.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */
{
  opacity: 0;
  transform: translateY(30px);
}

.main-title {
  margin-top: 50px;

  h1 {
    font-weight: bold;

  }
}

.mt-posts-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 64px 37px;
  margin-bottom: 200px;
  @media (max-width: #{$md}) {
    grid-template-columns: repeat(1, 100%);

  }
}
</style>