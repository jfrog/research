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


    activeChunk() {
      return [...this.$static.modelThreatsPosts.edges]
    },


  },
  components: {
    ModelThreatsListItem
  },
  mounted() {
    // let
  },
  methods: {
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