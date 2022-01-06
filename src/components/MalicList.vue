<template>
  <div>
    <ul
      class="block"
    >
      <component
        :is="MalicListItem"
        v-for="(edge, index) in $static.posts.edges"
        :key="edge.node.id"
        :mal="edge.node"
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
import MalicListItem from './MalicListItem.vue'
export default {
  name: 'VulnerabilityList',
  data() {
    return {
      MalicListItem: MalicListItem
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
    MalicListItem
  }
}
</script>