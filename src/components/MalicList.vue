<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="VulnerListItem"
        v-for="(edge, index) in $static.posts.edges"
        :key="edge.node.id"
        :vul="edge.node"
      />
    </ul>


  </div>



</template>

<static-query>
query Blog {
  posts: allPost (
    sortBy: "date_published",
    order: DESC,
    filter: {
      type: {eq: "malicious" }
    }
  ){
    edges {
      node {
        id
        path
        title
        description
        date_published
        platform
        downloads_text
      }
    }
  }
}
</static-query>

<script>
import VulnerListItem from './VulnerListItem.vue'
export default {
  name: 'VulnerabilityList',
  data() {
    return {
      VulnerListItem: VulnerListItem
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
    VulnerListItem
  }
}
</script>