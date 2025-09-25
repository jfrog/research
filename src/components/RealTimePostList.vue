<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="RealTimePostItem"
        v-for="edge in $static.RealTimePost.edges"
        :key="edge.node.id"
        :postObj="edge.node"
      />
    </ul>


  </div>



</template>

<static-query>
query realTimePostsMain {
RealTimePost: allRealTimePost (
sortBy: "date",
order: DESC,
limit: 4
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
import RealTimePostItem from './RealTimePostItem.vue'
export default {
  name: 'RealTimePostList',
  data() {
    return {
      RealTimePostItem: RealTimePostItem
    }
  },
  metaInfo: {
    title: "Security Research",
    meta: [
      {
        name: "description",
        content: "Cutting Edge Security Research to Protect the Modern Software Supply Chain",
      },
    ],
  },
  components: {
    RealTimePostItem: RealTimePostItem
  }
}
</script>